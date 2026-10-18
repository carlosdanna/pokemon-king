// Pure search logic (D-036): URL params in, filtered and sorted cards out.

import { compareCardNumber, type AlbumCard } from "./album";

/** An album card with the set it belongs to, as search works across sets. */
export type SearchCard = AlbumCard & { setId: string };

export const KINDS = {
  pokemon: "Pokemon",
  trainer: "Trainer",
  energy: "Energy",
} as const;
export type Kind = keyof typeof KINDS;

export const SORTS = ["set", "name", "number", "rarity"] as const;
export type Sort = (typeof SORTS)[number];

export const LEGAL_FORMATS = ["standard", "expanded"] as const;
export type LegalFormat = (typeof LEGAL_FORMATS)[number];

/** D-037: roughly most common to rarest; unknown rarities sort last. */
export const RARITY_ORDER = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Holo Rare",
  "Rare Holo LV.X",
  "Rare PRIME",
  "LEGEND",
  "Holo Rare V",
  "Holo Rare VMAX",
  "Holo Rare VSTAR",
  "Ultra Rare",
  "Amazing Rare",
  "Radiant Rare",
  "Shiny rare",
  "Shiny rare V",
  "Shiny rare VMAX",
  "Secret Rare",
  "Promo",
  "None",
];

export type SearchState = {
  q: string;
  set?: string;
  kind?: Kind;
  type?: string;
  rarity?: string;
  legal?: LegalFormat;
  /** Owned cards only (the default); false shows every printing. */
  owned: boolean;
  sort: Sort;
  page: number;
};

export const DEFAULT_SEARCH: SearchState = {
  q: "",
  owned: true,
  sort: "set",
  page: 1,
};

type Params = Record<string, string | string[] | undefined>;

const oneOf = <T extends string>(values: readonly T[], value?: string) =>
  values.find((v) => v === value);

export function parseSearch(params: Params): SearchState {
  const get = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const page = Number(get("page") ?? 1);
  return {
    q: get("q") ?? "",
    set: get("set"),
    kind: oneOf(Object.keys(KINDS) as Kind[], get("kind")),
    type: get("type"),
    rarity: get("rarity"),
    legal: oneOf(LEGAL_FORMATS, get("legal")),
    owned: get("owned") !== "all",
    sort: oneOf(SORTS, get("sort")) ?? "set",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export const hasFilters = (s: SearchState) =>
  Boolean(s.set || s.kind || s.type || s.rarity || s.legal || !s.owned);

/** `/search` URL for the state with `patch` applied; any change but `page` goes back to page 1. */
export function searchHref(state: SearchState, patch: Partial<SearchState>) {
  const s = { ...state, page: 1, ...patch };
  const params = new URLSearchParams();
  if (s.q) params.set("q", s.q);
  for (const key of ["set", "kind", "type", "rarity", "legal"] as const) {
    const value = s[key];
    if (value) params.set(key, value);
  }
  if (!s.owned) params.set("owned", "all");
  if (s.sort !== "set") params.set("sort", s.sort);
  if (s.page > 1) params.set("page", String(s.page));
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

/** Same query and sort, no filters (owned cards only again). */
export const clearFiltersHref = (s: SearchState) =>
  searchHref({ ...DEFAULT_SEARCH, q: s.q, sort: s.sort }, {});

/** Lower case without accents, so "flabebe" finds "Flabébé". */
export const fold = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function filterCards<T extends SearchCard>(
  cards: readonly T[],
  s: SearchState,
): T[] {
  const q = fold(s.q);
  return cards.filter(
    (c) =>
      (!s.owned || c.owned) &&
      (!s.set || c.setId === s.set) &&
      (!s.kind || c.category === KINDS[s.kind]) &&
      (!s.type || (c.types?.includes(s.type) ?? false)) &&
      (!s.rarity || c.rarity === s.rarity) &&
      (!s.legal || c.legal?.[s.legal] === true) &&
      (!q || fold(c.name).includes(q)),
  );
}

const rarityRank = (rarity?: string) => {
  const i = RARITY_ORDER.indexOf(rarity ?? "");
  return i < 0 ? RARITY_ORDER.length : i;
};

const nameCollator = new Intl.Collator("en", { sensitivity: "base" });

/** Input is in set order; the sort is stable, so ties keep it. */
export function sortCards<T extends SearchCard>(
  cards: readonly T[],
  sort: Sort,
): T[] {
  const compare = {
    set: () => 0,
    name: (a: T, b: T) => nameCollator.compare(a.name, b.name),
    number: (a: T, b: T) => compareCardNumber(a.number, b.number),
    rarity: (a: T, b: T) => rarityRank(a.rarity) - rarityRank(b.rarity),
  }[sort];
  return [...cards].sort(compare);
}

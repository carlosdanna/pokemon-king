// Pure search logic (D-036): URL params in, filtered and sorted cards out.

import { compareCardNumber, type AlbumCard } from "./album";

/** An album card with the set it belongs to, as search works across sets. */
export type SearchCard = AlbumCard & { setId: string; setName: string };

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
  /** Any of these sets, types and rarities (D-049); empty means any. */
  set: string[];
  kind?: Kind;
  type: string[];
  rarity: string[];
  legal?: LegalFormat;
  /** Owned cards only (the default); false shows every printing. */
  owned: boolean;
  sort: Sort;
  page: number;
};

export const DEFAULT_SEARCH: SearchState = {
  q: "",
  set: [],
  type: [],
  rarity: [],
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
  const all = (key: string) => [
    ...new Set(
      [params[key] ?? []]
        .flat()
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  const page = Number(get("page") ?? 1);
  return {
    q: get("q") ?? "",
    set: all("set"),
    kind: oneOf(Object.keys(KINDS) as Kind[], get("kind")),
    type: all("type"),
    rarity: all("rarity"),
    legal: oneOf(LEGAL_FORMATS, get("legal")),
    owned: get("owned") !== "all",
    sort: oneOf(SORTS, get("sort")) ?? "set",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export const hasFilters = (s: SearchState) =>
  Boolean(
    s.set.length ||
    s.kind ||
    s.type.length ||
    s.rarity.length ||
    s.legal ||
    !s.owned,
  );

/** `/search` URL for the state with `patch` applied; any change but `page` goes back to page 1. */
export function searchHref(state: SearchState, patch: Partial<SearchState>) {
  const s = { ...state, page: 1, ...patch };
  const params = new URLSearchParams();
  if (s.q) params.set("q", s.q);
  for (const key of ["set", "kind", "type", "rarity", "legal"] as const)
    for (const value of [s[key] ?? []].flat()) params.append(key, value);
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

/** Optimal string alignment distance (Levenshtein plus swapped neighbours). */
function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

/** Query words, split like card words so "mr. mime" and "#4" work. */
export const queryWords = (q: string) =>
  fold(q)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const cardWords = new WeakMap<SearchCard, { text: string; words: string[] }>();

/**
 * How well one query word hits a card (D-048): 4 set code or number,
 * 3 start of a word, 2 inside the name or set name, 1 a typo, 0 no match.
 */
function wordScore(card: SearchCard, word: string) {
  let folded = cardWords.get(card);
  if (!folded) {
    const text = fold(`${card.name} ${card.setName}`);
    folded = { text, words: text.split(/[^\p{L}\p{N}]+/u).filter(Boolean) };
    cardWords.set(card, folded);
  }
  if (word === card.setId || word === fold(card.number)) return 4;
  if (
    card.setId.startsWith(word) ||
    folded.words.some((w) => w.startsWith(word))
  )
    return 3;
  if (folded.text.includes(word)) return 2;
  if (word.length < 5 || /^\d+$/.test(word)) return 0;
  const allowed = word.length >= 9 ? 2 : 1;
  // Typos almost never hit the first letter; checking it skips most of the work.
  const close = folded.words.some(
    (w) =>
      w[0] === word[0] &&
      [-1, 0, 1].some(
        (n) => editDistance(word, w.slice(0, word.length + n)) <= allowed,
      ),
  );
  return close ? 1 : 0;
}

/** Every word must match; the weakest word decides, the sum ranks. */
export function matchScore(card: SearchCard, words: readonly string[]) {
  let min = Infinity;
  let sum = 0;
  for (const word of words) {
    const score = wordScore(card, word);
    if (!score) return { min: 0, sum: 0 };
    min = Math.min(min, score);
    sum += score;
  }
  return { min, sum };
}

export function filterCards<T extends SearchCard>(
  cards: readonly T[],
  s: SearchState,
): T[] {
  const filtered = cards.filter(
    (c) =>
      (!s.owned || c.owned) &&
      (!s.set.length || s.set.includes(c.setId)) &&
      (!s.kind || c.category === KINDS[s.kind]) &&
      (!s.type.length || s.type.some((t) => c.types?.includes(t))) &&
      (!s.rarity.length || s.rarity.includes(c.rarity ?? "")) &&
      (!s.legal || c.legal?.[s.legal] === true),
  );
  const words = queryWords(s.q);
  if (!words.length) return filtered;
  const scored = filtered.map((c) => ({ c, min: matchScore(c, words).min }));
  // Typo matches only when nothing matches as typed.
  const floor = scored.some((x) => x.min >= 2) ? 2 : 1;
  return scored.filter((x) => x.min >= floor).map((x) => x.c);
}

/** Best matches first; ties keep the input order (D-048). */
export function rankCards<T extends SearchCard>(
  cards: readonly T[],
  q: string,
) {
  const words = queryWords(q);
  return cards
    .map((c) => ({ c, sum: matchScore(c, words).sum }))
    .sort((a, b) => b.sum - a.sum)
    .map((x) => x.c);
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

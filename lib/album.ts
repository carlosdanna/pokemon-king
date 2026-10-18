// Pure album logic: no fs, so it can be unit-tested and shared with scripts.

/** pokemontcg image URLs, kept only for owned cards TCGdex has no image for. */
export type CardImages = { small: string; large: string };

/** One card in a set list (data/sets/<setId>.json), slimmed from TCGdex. */
export type SetCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  category: string;
  types?: string[];
  /** TCGdex image base URL; append `/low.webp` or `/high.webp`. */
  image?: string;
  images?: CardImages;
} & CardDetails;

export type Attack = {
  name: string;
  cost?: string[];
  damage?: string;
  effect?: string;
};
export type Ability = { type: string; name: string; effect: string };
export type TypeModifier = { type: string; value?: string };

/** TCGdex detail fields (D-032); absent when TCGdex lists none. */
export type CardDetails = {
  hp?: number;
  stage?: string;
  evolveFrom?: string;
  /** Rules text of Trainer and Energy cards. */
  effect?: string;
  trainerType?: string;
  energyType?: string;
  retreat?: number;
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: TypeModifier[];
  resistances?: TypeModifier[];
  legal?: { standard: boolean; expanded: boolean };
};

/** One set in data/sets.json. */
export type SetInfo = {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  printedTotal: number;
  /** TCGdex asset base URLs; append `.webp` or `.png`. */
  logo?: string;
  symbol?: string;
};

export type AlbumCard = SetCard & {
  owned: boolean;
  quantity: number;
};

export type AlbumPage = { cards: AlbumCard[]; page: number; pageCount: number };

export type ImageQuality = "low" | "high";

export const PAGE_SIZE = 9;

/** Set code of a pokemontcg card id ("base3-53" → "base3"). */
export const setCodeOf = (cardId: string) => cardId.split("-")[0];

// pokemontcg set codes that TCGdex names differently; all others are equal.
export const SET_ID_OVERRIDES: Record<string, string> = {
  base6: "lc",
  tk2b: "tk-ex-m",
  mcd11: "2011bw",
  mcd14: "2014xy",
  sm35: "sm3.5",
  sm75: "sm7.5",
  swsh35: "swsh3.5",
  swsh45: "swsh4.5",
  swsh45sv: "swsh4.5sv",
  pgo: "swsh10.5",
};
export const tcgdexSetId = (code: string) => SET_ID_OVERRIDES[code] ?? code;

/** Card number for matching across sources: "001" and "1" are equal. */
export const numberKey = (number: string) =>
  number.replace(/\d+/g, (n) => String(Number(n))).toUpperCase();

/** TCGdex image, else the pokemontcg one, else the card back (D-026). */
export function cardImage(card: SetCard, quality: ImageQuality) {
  if (card.image) return `${card.image}/${quality}.webp`;
  if (card.images)
    return quality === "low" ? card.images.small : card.images.large;
  return `/card-back/${quality}.webp`;
}

export function groupQuantities(cards: readonly { id: string }[]) {
  const quantities = new Map<string, number>();
  for (const { id } of cards) quantities.set(id, (quantities.get(id) ?? 0) + 1);
  return quantities;
}

const collator = new Intl.Collator("en", { numeric: true });
export const compareCardNumber = (a: string, b: string) =>
  collator.compare(a, b);

/**
 * Merges a set list with Ash's quantities, sorted by card number.
 * `extra` holds owned cards missing from the list, so they still show.
 */
export function mergeSet(
  setCards: readonly SetCard[],
  quantities: ReadonlyMap<string, number>,
  extra: readonly SetCard[] = [],
): AlbumCard[] {
  const byId = new Map(setCards.map((c) => [c.id, c]));
  for (const c of extra) if (!byId.has(c.id)) byId.set(c.id, c);
  return [...byId.values()]
    .map((card) => {
      const quantity = quantities.get(card.id) ?? 0;
      return { ...card, owned: quantity > 0, quantity };
    })
    .sort((a, b) => compareCardNumber(a.number, b.number));
}

/** Returns the 1-based page, or null when the page does not exist. */
export function paginate(
  cards: readonly AlbumCard[],
  page: number,
): AlbumPage | null {
  const pageCount = Math.ceil(cards.length / PAGE_SIZE);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) return null;
  const start = (page - 1) * PAGE_SIZE;
  return { cards: cards.slice(start, start + PAGE_SIZE), page, pageCount };
}

/**
 * Pages a turn leads to, or null at the ends. Spreads pair odd (left) with
 * even (right) pages, so a spread turn moves two pages (D-027).
 */
export function turnTargets(page: number, pageCount: number) {
  const left = page % 2 ? page : page - 1;
  const inRange = (n: number) => (n >= 1 && n <= pageCount ? n : null);
  return {
    left,
    prev: inRange(page - 1),
    next: inRange(page + 1),
    spreadPrev: inRange(left - 2),
    spreadNext: inRange(left + 2),
  };
}

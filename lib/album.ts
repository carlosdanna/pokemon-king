// Pure album logic: no fs, so it can be unit-tested and shared with scripts.

export type CardImages = { small: string; large: string };

/** One card in a set list (data/sets/<code>.json), slimmed from the TCG data. */
export type SetCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype: string;
  types?: string[];
  images: CardImages;
};

/** One set in data/sets.json. */
export type SetInfo = {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  images: { symbol: string; logo: string };
};

export type AlbumCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype: string;
  types?: string[];
  image: string;
  owned: boolean;
  quantity: number;
};

export type AlbumPage = { cards: AlbumCard[]; page: number; pageCount: number };

export const PAGE_SIZE = 9;

export const setCodeOf = (cardId: string) => cardId.split("-")[0];

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
 * `owned` holds Ash's own copies of this set, so a card missing from the list still shows.
 */
export function mergeSet(
  setCards: readonly SetCard[],
  quantities: ReadonlyMap<string, number>,
  owned: readonly SetCard[] = [],
): AlbumCard[] {
  const byId = new Map(setCards.map((c) => [c.id, c]));
  for (const c of owned) if (!byId.has(c.id)) byId.set(c.id, c);
  return [...byId.values()]
    .map(({ id, name, number, rarity, supertype, types, images }) => {
      const quantity = quantities.get(id) ?? 0;
      return {
        id,
        name,
        number,
        rarity,
        supertype,
        types,
        image: images.small,
        owned: quantity > 0,
        quantity,
      };
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

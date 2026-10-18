import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  groupQuantities,
  mergeSet,
  paginate,
  setCodeOf,
  tcgdexSetId,
  type AlbumCard,
  type CardImages,
  type SetCard,
  type SetInfo,
} from "./album";

const DATA = join(process.cwd(), "data");

const readJson = <T>(...path: string[]) =>
  JSON.parse(readFileSync(join(DATA, ...path), "utf8")) as T;

/** The fields used here from a pokemontcg card in ash_collection.json. */
type CollectionCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  supertype: string;
  types?: string[];
  images: CardImages;
};

type Collection = {
  /** Copies per TCGdex id (pokemontcg id for the few cards TCGdex lacks). */
  quantities: Map<string, number>;
  /** pokemontcg images per TCGdex id, the fallback when TCGdex has none. */
  images: Map<string, CardImages>;
  /** Owned cards TCGdex lacks, keyed by their pokemontcg id. */
  unmapped: SetCard[];
  sets: SetInfo[];
};

let cache: Collection | undefined;

function load(): Collection {
  if (cache) return cache;
  const idMap = readJson<Record<string, string>>("id-map.json");
  const owned = readJson<CollectionCard[]>("ash_collection.json");
  const idOf = (card: CollectionCard) => idMap[card.id] ?? card.id;
  const quantities = groupQuantities(owned.map((c) => ({ id: idOf(c) })));
  const images = new Map<string, CardImages>();
  const unmapped = new Map<string, SetCard>();
  for (const card of owned) {
    const id = idOf(card);
    images.set(id, card.images);
    if (!idMap[card.id])
      unmapped.set(id, {
        id,
        name: card.name,
        number: card.number,
        rarity: card.rarity,
        category: card.supertype.replace("é", "e"),
        types: card.types,
        images: card.images,
      });
  }
  cache = {
    quantities,
    images,
    unmapped: [...unmapped.values()],
    sets: readJson<SetInfo[]>("sets.json"),
  };
  return cache;
}

const setCards = new Map<string, AlbumCard[]>();

/** All cards of a set in album order, or null for an unknown set id. */
export function getSetCards(setId: string): AlbumCard[] | null {
  const { quantities, images, unmapped, sets } = load();
  // Only known ids reach the file path: setId comes from the URL.
  if (!sets.some((s) => s.id === setId)) return null;
  let cards = setCards.get(setId);
  if (!cards) {
    const list = readJson<SetCard[]>("sets", `${setId}.json`).map((c) =>
      c.image || !images.has(c.id) ? c : { ...c, images: images.get(c.id) },
    );
    cards = mergeSet(
      list,
      quantities,
      unmapped.filter((c) => tcgdexSetId(setCodeOf(c.id)) === setId),
    );
    setCards.set(setId, cards);
  }
  return cards;
}

export function getAlbumPage(setId: string, page: number) {
  const cards = getSetCards(setId);
  return cards && paginate(cards, page);
}

export function getSetSummaries() {
  return load().sets.map((set) => {
    const cards = getSetCards(set.id) ?? [];
    return {
      ...set,
      owned: cards.filter((c) => c.owned).length,
      total: cards.length,
    };
  });
}

export const getSet = (setId: string) =>
  load().sets.find((s) => s.id === setId) ?? null;

import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  groupQuantities,
  mergeSet,
  paginate,
  setCodeOf,
  type AlbumCard,
  type SetCard,
  type SetInfo,
} from "./album";

const DATA = join(process.cwd(), "data");

const readJson = <T>(...path: string[]) =>
  JSON.parse(readFileSync(join(DATA, ...path), "utf8")) as T;

let cache:
  | { owned: SetCard[]; quantities: Map<string, number>; sets: SetInfo[] }
  | undefined;

function load() {
  cache ??= (() => {
    const owned = readJson<SetCard[]>("ash_collection.json");
    return {
      owned,
      quantities: groupQuantities(owned),
      sets: readJson<SetInfo[]>("sets.json"),
    };
  })();
  return cache;
}

const setCards = new Map<string, AlbumCard[]>();

/** All cards of a set in album order, or null for an unknown set code. */
export function getSetCards(setCode: string): AlbumCard[] | null {
  const { owned, quantities, sets } = load();
  // Only known codes reach the file path: setCode comes from the URL.
  if (!sets.some((s) => s.id === setCode)) return null;
  let cards = setCards.get(setCode);
  if (!cards) {
    cards = mergeSet(
      readJson<SetCard[]>("sets", `${setCode}.json`),
      quantities,
      owned.filter((c) => setCodeOf(c.id) === setCode),
    );
    setCards.set(setCode, cards);
  }
  return cards;
}

export function getAlbumPage(setCode: string, page: number) {
  const cards = getSetCards(setCode);
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

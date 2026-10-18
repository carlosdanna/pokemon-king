import { describe, expect, it } from "vitest";
import {
  clearFiltersHref,
  DEFAULT_SEARCH,
  filterCards,
  hasFilters,
  parseSearch,
  rankCards,
  RARITY_ORDER,
  searchHref,
  sortCards,
  type SearchCard,
  type SearchState,
} from "./search";

const card = (name: string, extra: Partial<SearchCard> = {}): SearchCard => ({
  id: `s-${name}`,
  setId: "s",
  setName: "Test Set",
  name,
  number: "1",
  category: "Pokemon",
  owned: true,
  quantity: 1,
  ...extra,
});

const search = (patch: Partial<SearchState>) => ({
  ...DEFAULT_SEARCH,
  ...patch,
});
const names = (cards: SearchCard[]) => cards.map((c) => c.name);

describe("filterCards", () => {
  const cards = [
    card("Charmander", { types: ["Fire"], rarity: "Common" }),
    card("Charizard", {
      types: ["Fire"],
      rarity: "Rare Holo",
      setId: "base1",
      legal: { standard: false, expanded: true },
    }),
    card("Flabébé", { types: ["Fairy"], owned: false, quantity: 0 }),
    card("Potion", { category: "Trainer" }),
    card("Fire Energy", { category: "Energy" }),
  ];

  it("matches part of the name, ignoring case and accents", () => {
    expect(names(filterCards(cards, search({ q: "CHAR" })))).toEqual([
      "Charmander",
      "Charizard",
    ]);
    expect(
      names(filterCards(cards, search({ q: "flabebe", owned: false }))),
    ).toEqual(["Flabébé"]);
  });

  describe("matching words across name, set and number (D-048)", () => {
    const sets = [
      card("Charizard", {
        id: "base1-4",
        setId: "base1",
        setName: "Base Set",
        number: "4",
      }),
      card("Charmander", {
        id: "base1-46",
        setId: "base1",
        setName: "Base Set",
        number: "46",
      }),
      card("Charizard", {
        id: "base4-4",
        setId: "base4",
        setName: "Base Set 2",
        number: "4",
      }),
      card("Dark Charizard", {
        id: "base5-4",
        setId: "base5",
        setName: "Team Rocket",
        number: "4",
      }),
    ];
    const ids = (q: string) =>
      filterCards(sets, search({ q })).map((c) => c.id);

    it("needs every word to hit the name, set name, set code or number", () => {
      // Team Rocket's TCGdex code is base5, so "base" also hits it.
      expect(ids("base char")).toEqual([
        "base1-4",
        "base1-46",
        "base4-4",
        "base5-4",
      ]);
      expect(ids("base set char")).toEqual(["base1-4", "base1-46", "base4-4"]);
      expect(ids("charizard rocket")).toEqual(["base5-4"]);
      expect(ids("base1 #4")).toEqual(["base1-4"]);
      expect(ids("zard 46")).toEqual([]);
    });

    it("falls back to typo matches only when nothing matches as typed", () => {
      expect(ids("charzard")).toEqual(["base1-4", "base4-4", "base5-4"]);
      expect(ids("chraizard rocket")).toEqual(["base5-4"]);
      expect(ids("chax")).toEqual([]);
    });

    it("ranks closer matches first", () => {
      const ranked = rankCards(
        filterCards(sets, search({ q: "charizard 4" })),
        "charizard 4",
      );
      expect(ranked.map((c) => c.id)).toEqual([
        "base1-4",
        "base4-4",
        "base5-4",
      ]);
      expect(rankCards(sets, "dark").map((c) => c.id)[0]).toBe("base5-4");
    });
  });

  it("shows owned cards only unless owned is off", () => {
    expect(names(filterCards(cards, search({})))).not.toContain("Flabébé");
    expect(filterCards(cards, search({ owned: false }))).toHaveLength(5);
  });

  it("filters by set, kind, type, rarity and legality", () => {
    expect(names(filterCards(cards, search({ set: "base1" })))).toEqual([
      "Charizard",
    ]);
    expect(names(filterCards(cards, search({ kind: "trainer" })))).toEqual([
      "Potion",
    ]);
    expect(names(filterCards(cards, search({ type: "Fire" })))).toEqual([
      "Charmander",
      "Charizard",
    ]);
    expect(names(filterCards(cards, search({ rarity: "Common" })))).toEqual([
      "Charmander",
    ]);
    // Cards without legality data never match.
    expect(names(filterCards(cards, search({ legal: "expanded" })))).toEqual([
      "Charizard",
    ]);
    expect(filterCards(cards, search({ legal: "standard" }))).toEqual([]);
  });

  it("combines filters", () => {
    expect(
      names(filterCards(cards, search({ q: "char", rarity: "Common" }))),
    ).toEqual(["Charmander"]);
    expect(filterCards(cards, search({ q: "potion", type: "Fire" }))).toEqual(
      [],
    );
  });
});

describe("sortCards", () => {
  const cards = [
    card("Bulbasaur", { number: "10", rarity: "Promo" }),
    card("abra", { number: "2", rarity: "Common" }),
    card("Caterpie", { number: "1", rarity: "Mystery" }),
    card("Diglett", { number: "3", rarity: "Common" }),
  ];

  it("keeps set order by default", () => {
    expect(names(sortCards(cards, "set"))).toEqual(names(cards));
  });

  it("sorts by name, ignoring case", () => {
    expect(names(sortCards(cards, "name"))).toEqual([
      "abra",
      "Bulbasaur",
      "Caterpie",
      "Diglett",
    ]);
  });

  it("sorts card numbers naturally", () => {
    expect(names(sortCards(cards, "number"))).toEqual([
      "Caterpie",
      "abra",
      "Diglett",
      "Bulbasaur",
    ]);
  });

  it("sorts by the fixed rarity order, unknown last, ties in set order", () => {
    expect(RARITY_ORDER.indexOf("Common")).toBe(0);
    expect(names(sortCards(cards, "rarity"))).toEqual([
      "abra",
      "Diglett",
      "Bulbasaur",
      "Caterpie",
    ]);
  });
});

describe("parseSearch and searchHref", () => {
  it("defaults to owned cards, set order, page 1", () => {
    expect(parseSearch({})).toEqual(DEFAULT_SEARCH);
    expect(searchHref(DEFAULT_SEARCH, {})).toBe("/search");
  });

  it("ignores invalid values", () => {
    expect(
      parseSearch({
        kind: "dragon",
        legal: "unlimited",
        sort: "price",
        page: "-2",
        owned: "yes",
        q: "  ",
      }),
    ).toEqual(DEFAULT_SEARCH);
    expect(parseSearch({ page: "2.5" }).page).toBe(1);
    expect(parseSearch({ q: ["pika", "chu"] }).q).toBe("pika");
  });

  it("round-trips a full state through the URL", () => {
    const state = search({
      q: "char",
      set: "base1",
      kind: "pokemon",
      type: "Fire",
      rarity: "Rare Holo",
      legal: "expanded",
      owned: false,
      sort: "rarity",
      page: 3,
    });
    const url = new URL(searchHref(state, { page: 3 }), "http://x");
    expect(parseSearch(Object.fromEntries(url.searchParams))).toEqual(state);
  });

  it("goes back to page 1 when anything but the page changes", () => {
    const state = search({ q: "char", page: 4 });
    expect(searchHref(state, { type: "Fire" })).toBe(
      "/search?q=char&type=Fire",
    );
    expect(searchHref(state, { page: 5 })).toBe("/search?q=char&page=5");
  });

  it("clears filters but keeps the query and sort", () => {
    const state = search({
      q: "char",
      type: "Fire",
      owned: false,
      sort: "name",
      page: 2,
    });
    expect(clearFiltersHref(state)).toBe("/search?q=char&sort=name");
  });

  it("counts owned = all as a filter, the query and sort not", () => {
    expect(hasFilters(search({ q: "x", sort: "name" }))).toBe(false);
    expect(hasFilters(search({ owned: false }))).toBe(true);
    expect(hasFilters(search({ rarity: "Rare" }))).toBe(true);
  });
});

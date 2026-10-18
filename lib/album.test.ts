import { describe, expect, it } from "vitest";
import {
  compareCardNumber,
  groupQuantities,
  mergeSet,
  paginate,
  PAGE_SIZE,
  type SetCard,
} from "./album";

const card = (id: string, number = id.split("-")[1]): SetCard => ({
  id,
  name: `Card ${id}`,
  number,
  supertype: "Pokémon",
  images: { small: `${id}.png`, large: `${id}_hires.png` },
});

const cards = (n: number) =>
  mergeSet(
    Array.from({ length: n }, (_, i) => card(`s-${i + 1}`)),
    new Map(),
  );

describe("groupQuantities", () => {
  it("counts duplicate entries as copies, up to 7", () => {
    const entries = [
      ...Array.from({ length: 7 }, () => ({ id: "gym2-129" })),
      { id: "base3-53" },
    ];
    const q = groupQuantities(entries);
    expect(q.get("gym2-129")).toBe(7);
    expect(q.get("base3-53")).toBe(1);
    expect(q.size).toBe(2);
  });
});

describe("compareCardNumber", () => {
  it("sorts numbers naturally, including prefixes and suffixes", () => {
    const numbers = ["SV114", "10", "RC15", "116a", "2", "RC2", "116", "SV12"];
    expect(numbers.sort(compareCardNumber)).toEqual([
      "2",
      "10",
      "116",
      "116a",
      "RC2",
      "RC15",
      "SV12",
      "SV114",
    ]);
  });
});

describe("mergeSet", () => {
  it("marks unowned cards with quantity 0 and owned with their count", () => {
    const merged = mergeSet([card("s-2"), card("s-1")], new Map([["s-2", 3]]));
    expect(merged.map((c) => [c.id, c.owned, c.quantity])).toEqual([
      ["s-1", false, 0],
      ["s-2", true, 3],
    ]);
    expect(merged[0].image).toBe("s-1.png");
  });

  it("keeps owned cards missing from the set list", () => {
    const merged = mergeSet([card("s-1")], new Map([["s-5", 1]]), [
      card("s-5"),
      card("s-5"),
    ]);
    expect(merged.map((c) => c.id)).toEqual(["s-1", "s-5"]);
    expect(merged[1].owned).toBe(true);
  });
});

describe("paginate", () => {
  it("fits 9 cards on one page", () => {
    expect(paginate(cards(9), 1)).toMatchObject({ page: 1, pageCount: 1 });
    expect(paginate(cards(9), 1)?.cards).toHaveLength(PAGE_SIZE);
  });

  it("puts the 10th card alone on page 2", () => {
    const page = paginate(cards(10), 2);
    expect(page).toMatchObject({ page: 2, pageCount: 2 });
    expect(page?.cards.map((c) => c.id)).toEqual(["s-10"]);
  });

  it("returns null for pages that do not exist", () => {
    expect(paginate(cards(10), 0)).toBeNull();
    expect(paginate(cards(10), 3)).toBeNull();
    expect(paginate(cards(10), 1.5)).toBeNull();
    expect(paginate(cards(10), NaN)).toBeNull();
  });
});

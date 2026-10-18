import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getAlbumPage, getSetCards, getSetSummaries } =
  await import("./collection");

describe("collection (real data)", () => {
  it("returns 9 typed cards for the first page of a set", () => {
    const page = getAlbumPage("base3", 1);
    expect(page?.cards).toHaveLength(9);
    for (const c of page?.cards ?? []) {
      expect(typeof c.owned).toBe("boolean");
      expect(c.quantity).toBeGreaterThanOrEqual(c.owned ? 1 : 0);
    }
  });

  it("uses TCGdex ids and keeps owned cards TCGdex lacks", () => {
    // pokemontcg "sm35-23" is TCGdex "sm3.5-23"
    const sm35 = getSetCards("sm3.5") ?? [];
    expect(sm35[0].id).toBe("sm3.5-1");
    expect(sm35.find((c) => c.id === "sm3.5-23")?.owned).toBe(true);
    expect(getSetCards("sm35")).toBeNull();
    const sm3 = getSetCards("sm3") ?? [];
    expect(sm3.find((c) => c.id === "sm3-116a")).toMatchObject({
      owned: true,
      name: "Kiawe",
    });
  });

  it("rejects unknown set codes and pages", () => {
    expect(getAlbumPage("../ash_collection", 1)).toBeNull();
    expect(getAlbumPage("base3", 999)).toBeNull();
  });

  it("summarises all 121 sets and counts every owned card once", () => {
    const summaries = getSetSummaries();
    expect(summaries).toHaveLength(121);
    expect(summaries.reduce((n, s) => n + s.owned, 0)).toBe(1644);
    for (const s of summaries) expect(s.owned).toBeLessThanOrEqual(s.total);
  });
});

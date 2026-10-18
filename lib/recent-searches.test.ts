import { beforeEach, expect, it } from "vitest";
import { saveSearch } from "./recent-searches";

beforeEach(() => localStorage.clear());

it("keeps the last 5 searches, newest first, without duplicates", () => {
  for (const q of ["a", "b", "c", "d", "e", "f", " B ", ""]) saveSearch(q);
  expect(JSON.parse(localStorage.getItem("recent-searches") ?? "")).toEqual([
    "B",
    "f",
    "e",
    "d",
    "c",
  ]);
});

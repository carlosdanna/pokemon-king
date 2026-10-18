import { describe, expect, it } from "vitest";
import { gridMove, isTypingTarget } from "./grid";

describe("gridMove", () => {
  it("moves within one 3x3 page", () => {
    expect(gridMove("ArrowRight", 0, 3, [9])).toBe(1);
    expect(gridMove("ArrowDown", 1, 3, [9])).toBe(4);
    expect(gridMove("ArrowUp", 4, 3, [9])).toBe(1);
    expect(gridMove("ArrowLeft", 4, 3, [9])).toBe(3);
  });

  it("stops at the edges instead of wrapping", () => {
    expect(gridMove("ArrowLeft", 3, 3, [9])).toBeNull();
    expect(gridMove("ArrowRight", 2, 3, [9])).toBeNull();
    expect(gridMove("ArrowUp", 1, 3, [9])).toBeNull();
    expect(gridMove("ArrowDown", 7, 3, [9])).toBeNull();
  });

  it("crosses between the pages of a spread on the same row", () => {
    expect(gridMove("ArrowRight", 5, 3, [9, 9])).toBe(12);
    expect(gridMove("ArrowLeft", 12, 3, [9, 9])).toBe(5);
    expect(gridMove("ArrowRight", 17, 3, [9, 9])).toBeNull();
  });

  it("skips empty pockets on a short last page", () => {
    expect(gridMove("ArrowRight", 2, 3, [9, 4])).toBe(9);
    expect(gridMove("ArrowRight", 5, 3, [9, 4])).toBe(12);
    expect(gridMove("ArrowRight", 8, 3, [9, 4])).toBeNull();
    expect(gridMove("ArrowRight", 12, 3, [9, 4])).toBeNull();
    expect(gridMove("ArrowDown", 0, 3, [2])).toBeNull();
  });

  it("jumps to the first and last card", () => {
    expect(gridMove("Home", 7, 3, [9, 4])).toBe(0);
    expect(gridMove("End", 0, 3, [9, 4])).toBe(12);
    expect(gridMove("End", 0, 3, [])).toBeNull();
  });

  it("uses the column count it is given", () => {
    expect(gridMove("ArrowDown", 0, 2, [9])).toBe(2);
    expect(gridMove("ArrowRight", 1, 2, [9])).toBeNull();
  });

  it("ignores other keys", () => {
    expect(gridMove("a", 0, 3, [9])).toBeNull();
  });
});

describe("isTypingTarget", () => {
  it("is true inside form fields only", () => {
    const input = document.createElement("input");
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    editable.append(document.createElement("span"));
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(editable.firstChild)).toBe(true);
    expect(isTypingTarget(document.createElement("a"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

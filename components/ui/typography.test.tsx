import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Typography } from "./typography";

test("variant picks its default tag", () => {
  render(<Typography variant="h2">Sets</Typography>);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Sets");
});

test("as replaces the tag but keeps the variant styles", () => {
  render(
    <Typography variant="h1" as="span">
      Title
    </Typography>,
  );
  const el = screen.getByText("Title");
  expect(el.tagName).toBe("SPAN");
  expect(el).toHaveClass("text-4xl", "font-bold");
});

test("size, weight and color override the variant defaults", () => {
  render(
    <Typography variant="h1" size="sm" weight="normal" color="muted">
      Small
    </Typography>,
  );
  const el = screen.getByText("Small");
  expect(el).toHaveClass("text-sm", "font-normal", "text-muted-foreground");
  expect(el).not.toHaveClass("text-4xl");
  expect(el).not.toHaveClass("font-bold");
});

test("as types the props of the chosen tag", () => {
  render(
    <Typography as="time" dateTime="2026-10-18">
      Today
    </Typography>,
  );
  expect(screen.getByText("Today")).toHaveAttribute("datetime", "2026-10-18");
  // @ts-expect-error a <p> has no dateTime
  void (<Typography as="p" dateTime="2026-10-18" />);
});

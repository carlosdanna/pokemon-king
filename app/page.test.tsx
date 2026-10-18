import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.stubGlobal(
  "fetch",
  vi.fn(() => Promise.resolve(Response.json({ synced: false, ids: [] }))),
);

const { default: Home } = await import("./page");

test("home page shows pins, search and set shortcuts", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Ash's Card Album",
  );
  for (const name of ["Pinned", "Search", "Sets"])
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "All sets →" })).toBeInTheDocument();
});

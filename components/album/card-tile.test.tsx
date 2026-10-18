import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AlbumCard } from "@/lib/album";
import { CardTile } from "./card-tile";

vi.mock("next/navigation", () => ({ usePathname: () => "/album/base1" }));

const card = (over: Partial<AlbumCard> = {}): AlbumCard => ({
  id: "base1-4",
  name: "Charizard",
  number: "4",
  category: "Pokemon",
  image: "https://assets.tcgdex.net/en/base/base1/4",
  owned: true,
  quantity: 1,
  ...over,
});

describe("CardTile", () => {
  it("shows an owned single copy in colour with no counter", () => {
    render(<CardTile card={card()} />);
    const img = screen.getByRole("img", { name: "Charizard, number 4" });
    expect(img).not.toHaveClass("grayscale");
    expect(screen.queryByText(/×/)).toBeNull();
  });

  it("greys out unowned cards", () => {
    render(<CardTile card={card({ owned: false, quantity: 0 })} />);
    expect(screen.getByRole("img", { name: /not in collection/ })).toHaveClass(
      "grayscale",
      "opacity-45",
    );
  });

  it("counts copies above one", () => {
    render(<CardTile card={card({ quantity: 3 })} />);
    expect(screen.getByText("×3")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /3 copies/ })).toBeInTheDocument();
  });

  it("falls back to the card back with name and number", () => {
    render(<CardTile card={card()} />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img").getAttribute("src")).toContain("card-back");
    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  it("links to the card's zoom", () => {
    render(<CardTile card={card()} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/cards/base1-4");
  });
});

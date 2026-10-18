import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AlbumCard, SetInfo } from "@/lib/album";
import { CardPanel } from "./card-panel";

let search = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => search }));

const set: SetInfo = {
  id: "base1",
  name: "Base Set",
  series: "Base",
  releaseDate: "1999/01/09",
  total: 102,
  printedTotal: 102,
};

const card = (over: Partial<AlbumCard>): AlbumCard => ({
  id: "base1-4",
  name: "Charizard",
  number: "4",
  rarity: "Rare",
  category: "Pokemon",
  owned: true,
  quantity: 2,
  ...over,
});

const charizard = card({
  hp: 120,
  types: ["Fire"],
  stage: "Stage2",
  evolveFrom: "Charmeleon",
  attacks: [
    {
      name: "Fire Spin",
      cost: ["Fire", "Fire", "Fire", "Fire"],
      damage: "100",
      effect: "Discard 2 Energy cards attached to Charizard.",
    },
  ],
  weaknesses: [{ type: "Water", value: "×2" }],
  retreat: 3,
  legal: { standard: false, expanded: true },
});

const fact = (label: string) =>
  screen.getByText(label, { selector: "dt" }).nextElementSibling;

describe("CardPanel", () => {
  beforeEach(() => {
    search = new URLSearchParams();
  });

  it("shows a Pokémon's facts and attacks", () => {
    render(<CardPanel card={charizard} set={set} />);
    expect(fact("HP")).toHaveTextContent("120");
    expect(fact("Types")).toHaveTextContent("Fire");
    expect(fact("Copies owned")).toHaveTextContent("2");
    expect(fact("Stage")).toHaveTextContent("Stage2, from Charmeleon");
    expect(screen.getByRole("tab", { name: "Attacks" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Fire Spin")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("lists missing resistances as none listed", () => {
    search = new URLSearchParams("tab=weaknesses");
    render(<CardPanel card={charizard} set={set} />);
    expect(fact("Weaknesses")).toHaveTextContent("Water ×2");
    expect(fact("Resistances")).toHaveTextContent("none listed");
    expect(fact("Retreat cost")).toHaveTextContent("3");
  });

  it("opens the tab named in the URL and writes tab changes back", () => {
    search = new URLSearchParams("tab=legal");
    render(<CardPanel card={charizard} set={set} />);
    expect(fact("Standard")).toHaveTextContent("Not legal");
    expect(fact("Expanded")).toHaveTextContent("Legal");
    fireEvent.click(screen.getByRole("tab", { name: "Attacks" }));
    expect(window.location.search).toBe("?tab=attacks");
  });

  it("falls back to the first tab for an unknown ?tab=", () => {
    search = new URLSearchParams("tab=bogus");
    render(<CardPanel card={charizard} set={set} />);
    expect(screen.getByRole("tab", { name: "Attacks" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("shows a Trainer's rules text instead of tabs", () => {
    render(
      <CardPanel
        card={card({
          name: "Bill",
          category: "Trainer",
          trainerType: "Item",
          effect: "Draw 2 cards.",
        })}
        set={set}
      />,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByText("HP", { selector: "dt" })).toBeNull();
    expect(fact("Trainer type")).toHaveTextContent("Item");
    expect(screen.getByText("Draw 2 cards.")).toBeInTheDocument();
  });

  it("says none listed for a basic Energy with no rules text", () => {
    render(
      <CardPanel
        card={card({
          name: "Fire Energy",
          category: "Energy",
          rarity: undefined,
          owned: false,
          quantity: 0,
        })}
        set={set}
      />,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(fact("Energy type")).toHaveTextContent("none listed");
    expect(fact("Rarity")).toHaveTextContent("none listed");
    expect(fact("Copies owned")).toHaveTextContent("0");
    expect(screen.getByRole("region", { name: "Rules" })).toHaveTextContent(
      "none listed",
    );
  });
});

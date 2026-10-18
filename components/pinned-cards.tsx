"use client";

import { useEffect, useState } from "react";
import { CardTile } from "@/components/album/card-tile";
import { Typography } from "@/components/ui/typography";
import type { AlbumCard } from "@/lib/album";
import { useFavourites } from "@/lib/favourites";

/** Pinned cards as binder pockets; card data comes from /api/cards (D-041). */
export function PinnedCards() {
  const ids = useFavourites();
  const [cards, setCards] = useState<AlbumCard[] | null>(null);
  const missing = [...ids].filter((id) => !cards?.some((c) => c.id === id));
  const key = missing.sort().join(",");

  useEffect(() => {
    if (!key) return;
    let live = true;
    fetch(`/api/cards?ids=${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((found: AlbumCard[]) => {
        if (live) setCards((old) => [...(old ?? []), ...found]);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);

  // Unpinning hides a card at once; the fetched data stays for a re-pin.
  const shown = (cards ?? []).filter((c) => ids.has(c.id));
  if (!shown.length)
    return (
      <Typography variant="small" color="muted" weight="normal" as="p">
        {ids.size
          ? "Loading your pins…"
          : "No pinned cards yet. Use the pin in a card's corner to keep it here."}
      </Typography>
    );
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
      {shown.map((card) => (
        <li key={card.id}>
          <CardTile card={card} />
        </li>
      ))}
    </ul>
  );
}

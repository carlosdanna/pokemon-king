"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardTile } from "@/components/album/card-tile";
import { Typography } from "@/components/ui/typography";
import type { AlbumCard } from "@/lib/album";
import { useFavourites } from "@/lib/favourites";

/**
 * Pinned cards as binder pockets; card data comes from /api/cards (D-041).
 * With `limit` (Home), two rows: 8 below 1024 px, 12 from it (D-050).
 */
export function PinnedCards({ limit }: { limit?: number }) {
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
  const capped = limit ? shown.slice(0, limit) : shown;
  return (
    <>
      <ul
        className={
          limit
            ? "grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-6 max-lg:[&>li:nth-child(n+9)]:hidden"
            : "grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6"
        }
      >
        {capped.map((card) => (
          <li key={card.id}>
            <CardTile card={card} />
          </li>
        ))}
      </ul>
      {limit && shown.length > 8 && (
        // Below lg only 8 show, so the link appears from 9 pins; on lg from 13.
        <Link
          href="/pinned"
          className={`self-start rounded-sm underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${shown.length > limit ? "" : "lg:hidden"}`}
        >
          <Typography as="span" variant="small">
            See all {shown.length} pinned cards →
          </Typography>
        </Link>
      )}
    </>
  );
}

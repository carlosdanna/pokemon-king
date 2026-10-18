"use client";

import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PinToggle } from "@/components/pin-toggle";
import { Typography } from "@/components/ui/typography";
import { cardImage, type AlbumCard } from "@/lib/album";

export function CardTile({ card }: { card: AlbumCard }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const label = [
    `${card.name}, number ${card.number}`,
    card.owned ? null : "not in collection",
    card.quantity > 1 ? `${card.quantity} copies` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const href = `/cards/${card.id}`;
  const zoomed = usePathname() === href;
  const image = (
    <Image
      src={status === "error" ? "/card-back/low.webp" : cardImage(card, "low")}
      alt={label}
      fill
      unoptimized
      sizes="220px"
      loading="eager"
      onLoad={() => setStatus((s) => (s === "error" ? s : "loaded"))}
      onError={() => setStatus("error")}
      className={cn(
        "rounded-[4.5%] object-cover",
        !card.owned && "opacity-45 grayscale",
      )}
    />
  );

  // The pin sits beside the link, not in it: a button can't nest inside a link.
  // Full prefetch puts the overlay in the cache before the click, so it renders
  // at once and its card pairs with this one for the morph.
  return (
    <div className="group relative">
      <Link
        href={href}
        prefetch
        data-card-link={card.id}
        className="binder-pocket block outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground"
      >
        {status === "loading" && <Skeleton className="absolute inset-0" />}
        {/* While zoomed the album stays mounted; dropping the name here lets React
          pair this card with the zoomed one (and back again on close). */}
        {zoomed ? (
          image
        ) : (
          <ViewTransition name={`card-${card.id}`} share="morph" default="none">
            {image}
          </ViewTransition>
        )}
        {status === "error" && (
          <div
            aria-hidden
            className="absolute inset-x-1 bottom-2 z-10 rounded-sm bg-background/90 p-1 text-center"
          >
            <Typography as="p" variant="caption" color="default">
              {card.name}
            </Typography>
            <Typography as="p" variant="caption">
              #{card.number}
            </Typography>
          </div>
        )}
        {card.quantity > 1 && (
          <Badge aria-hidden className="absolute top-1 right-1 z-10 shadow-sm">
            <Typography as="span" variant="caption" color="inherit">
              ×{card.quantity}
            </Typography>
          </Badge>
        )}
      </Link>
      <PinToggle
        id={card.id}
        name={card.name}
        // Keyboard pins with `f` (D-045); one tab stop per binder.
        tabIndex={-1}
        className="absolute top-1 left-1 z-10 size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-pinned:opacity-100 pointer-coarse:not-data-pinned:pointer-events-none"
      />
    </div>
  );
}

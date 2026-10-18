"use client";

import { cn } from "cn";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Top-left corner stays free for the favourite pin (M5).
  return (
    <div className="binder-pocket">
      {status === "loading" && <Skeleton className="absolute inset-0" />}
      <Image
        src={
          status === "error" ? "/card-back/low.webp" : cardImage(card, "low")
        }
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
    </div>
  );
}

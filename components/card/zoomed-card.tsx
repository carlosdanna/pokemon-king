"use client";

import { cn } from "cn";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState, ViewTransition } from "react";
import Tilt from "react-parallax-tilt";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { cardImage, type AlbumCard } from "@/lib/album";

/** The large card, always in colour; pairs with its album tile for the morph. */
export function ZoomedCard({
  card,
  className,
}: {
  card: AlbumCard;
  className?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [highFailed, setHighFailed] = useState(false);
  const alt = `${card.name}, number ${card.number}`;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ViewTransition name={`card-${card.id}`} share="morph" default="none">
        <Tilt
          tiltEnable={!reduceMotion}
          glareEnable={!reduceMotion}
          glareMaxOpacity={0.35}
          glarePosition="all"
          glareBorderRadius="4.5%"
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          className="relative aspect-245/337 w-full rounded-[4.5%] shadow-2xl"
        >
          {/* The low image is cached from the album, so the morph has pixels at once. */}
          <Image
            src={cardImage(card, "low")}
            alt={highFailed ? alt : ""}
            fill
            unoptimized
            sizes="400px"
            className="rounded-[4.5%] object-cover"
          />
          {!highFailed && (
            <Image
              src={cardImage(card, "high")}
              alt={alt}
              fill
              unoptimized
              sizes="600px"
              onError={() => setHighFailed(true)}
              className="rounded-[4.5%] object-cover"
            />
          )}
        </Tilt>
      </ViewTransition>
      {!card.owned && (
        // Under the card, not over its name line.
        <Badge variant="secondary" className="shadow-md">
          <Typography as="span" variant="caption" color="inherit">
            Not in collection
          </Typography>
        </Badge>
      )}
    </div>
  );
}

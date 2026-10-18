"use client";

import { cn } from "cn";
import { Star, StarOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toggleFavourite, useFavourites } from "@/lib/favourites";

/** Pin button with a stable label; `aria-pressed` carries the state. */
export function PinToggle({
  id,
  name,
  className,
  tabIndex,
}: {
  id: string;
  name: string;
  className?: string;
  tabIndex?: number;
}) {
  const pinned = useFavourites().has(id);
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-pressed={pinned}
      tabIndex={tabIndex}
      aria-label={`Pin ${name}`}
      title={pinned ? "Unpin" : "Pin"}
      onClick={() => void toggleFavourite(id)}
      whileTap={reduce ? undefined : { scale: 0.8 }}
      data-pinned={pinned || undefined}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full border bg-background/90 shadow-sm outline-none transition-colors hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground",
        pinned &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
    >
      {/* Two outline icons, not a fill: filling the outline distorted it (D-051). */}
      {pinned ? (
        <StarOff aria-hidden className="size-4" />
      ) : (
        <Star aria-hidden className="size-4" />
      )}
    </motion.button>
  );
}

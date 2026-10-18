"use client";

import { Search } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { openPalette } from "./command-palette";

/** Looks like a search field; opens the command palette (D-048). */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={openPalette}
      aria-keyshortcuts="Control+K Meta+K"
      className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-muted-foreground outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <Typography
        as="span"
        variant="small"
        color="inherit"
        weight="normal"
        className="truncate"
      >
        Search cards and sets
      </Typography>
      <Typography
        as="span"
        variant="caption"
        aria-hidden
        className="ml-auto hidden rounded border px-1.5 py-0.5 font-mono sm:inline"
      >
        Ctrl K
      </Typography>
    </button>
  );
}

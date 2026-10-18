"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { toggleFavourite } from "@/lib/favourites";
import { isTypingTarget } from "@/lib/grid";
import { CommandPalette, onOpenPalette } from "./command-palette";

const SHORTCUTS = [
  ["/", "Search: the page's search box, else the palette"],
  ["Ctrl / ⌘ K", "Jump to a page, set or card"],
  ["g h · g a", "Go to Home · Album"],
  ["Arrows · Home · End", "Move between cards"],
  ["Enter", "Zoom the focused card"],
  ["PageUp · PageDown or , · .", "Turn the page"],
  ["f", "Pin or unpin the focused or zoomed card"],
  ["[ · ]", "Previous · next card while zoomed"],
  ["Esc", "Close the card or this overlay"],
  ["?", "Show these shortcuts"],
] as const;

const GO: Record<string, string> = { h: "/", a: "/album" };

/** Site-wide shortcuts (D-046), the help overlay and the command palette. */
export function KeyboardShortcuts({
  sets,
}: {
  sets: readonly { id: string; name: string }[];
}) {
  const router = useRouter();
  const [help, setHelp] = useState(false);
  const [palette, setPalette] = useState(false);
  const gAt = useRef(0);

  const onKey = (e: KeyboardEvent) => {
    const zoom = document.querySelector<HTMLElement>(
      "dialog[open][data-card-id]",
    );
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !zoom) {
      e.preventDefault();
      setPalette(true);
      return;
    }
    if (help || palette || e.ctrlKey || e.altKey || e.metaKey) return;
    if (isTypingTarget(e.target)) return;

    const g = Date.now() - gAt.current < 1000;
    gAt.current = 0;
    if (g && GO[e.key] && !zoom) {
      e.preventDefault();
      router.push(GO[e.key]);
    } else if (e.key === "g") {
      gAt.current = Date.now();
    } else if (e.key === "f") {
      const id =
        zoom?.dataset.cardId ??
        document.activeElement?.closest<HTMLElement>("[data-card-link]")
          ?.dataset.cardLink ??
        // Next keeps left routes mounted but hidden, so only a visible card page counts.
        [...document.querySelectorAll<HTMLElement>("[data-card-id]")].find(
          (el) => el.checkVisibility(),
        )?.dataset.cardId;
      if (id) void toggleFavourite(id);
    } else if ((e.key === "[" || e.key === "]") && zoom) {
      // The album stays mounted (inert) under the overlay: step through its visible cards.
      const ids = [
        ...document.querySelectorAll<HTMLElement>("[data-card-link]"),
      ]
        .filter((l) => l.checkVisibility())
        .map((l) => l.dataset.cardLink);
      const next =
        ids[ids.indexOf(zoom.dataset.cardId) + (e.key === "]" ? 1 : -1)];
      if (next && ids.includes(zoom.dataset.cardId))
        router.replace(`/cards/${next}`, { scroll: false });
    } else if (zoom) {
      return;
    } else if (e.key === "/") {
      e.preventDefault();
      const box = [
        ...document.querySelectorAll<HTMLElement>("[role=search] input"),
      ].find((el) => el.checkVisibility());
      if (box) box.focus();
      else setPalette(true);
    } else if (e.key === "?") {
      e.preventDefault();
      setHelp(true);
    }
  };
  // Bound once; always runs the latest handler.
  const handler = useRef(onKey);
  useLayoutEffect(() => {
    handler.current = onKey;
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handler.current(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => onOpenPalette(() => setPalette(true)), []);

  return (
    <>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Single keys are ignored while you type in a field.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            {SHORTCUTS.map(([keys, action]) => (
              <div key={keys} className="contents">
                <Typography as="dt" variant="small" className="font-mono">
                  {keys}
                </Typography>
                <Typography as="dd" variant="small" weight="normal">
                  {action}
                </Typography>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
      <CommandPalette open={palette} onOpenChange={setPalette} sets={sets} />
    </>
  );
}

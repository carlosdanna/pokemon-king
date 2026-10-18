"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Typography } from "@/components/ui/typography";
import { gridMove, isTypingTarget } from "@/lib/grid";
import { pageHref, type Turns } from "./page-nav";

const MIN_SWIPE = 50;
const GRID_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
];

/**
 * The binder's input: swipe and keyboard page turns, plus the roving
 * tabindex over the cards of the visible page(s) (D-045, D-046).
 */
export function SwipeTurn({
  base,
  turns,
  page,
  pageCount,
  children,
}: {
  base: string;
  turns: Turns;
  page: number;
  pageCount: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);
  const container = useRef<HTMLDivElement>(null);
  // Pocket to focus once a keyboard turn has rendered the new page.
  const pending = useRef<number | null>(null);
  const firstPage = useRef(page);
  const [announcement, setAnnouncement] = useState("");

  const links = () =>
    [
      ...(container.current?.querySelectorAll<HTMLElement>(
        "[data-card-link]",
      ) ?? []),
    ].filter((l) => l.checkVisibility());

  const turnTo = (forward: boolean) => {
    const spread = window.matchMedia("(min-width: 1280px)").matches;
    const target = forward
      ? spread
        ? turns.spreadNext
        : turns.next
      : spread
        ? turns.spreadPrev
        : turns.prev;
    if (target === null) return false;
    router.push(pageHref(base, target), {
      scroll: false,
      transitionTypes: [forward ? "page-forward" : "page-back"],
    });
    return true;
  };
  // The listener below is bound once; it calls the latest closure.
  const turnRef = useRef(turnTo);
  useLayoutEffect(() => {
    turnRef.current = turnTo;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || isTypingTarget(e.target))
        return;
      // The zoom overlay and other dialogs own the keyboard while open.
      if (document.querySelector("dialog[open], [role=dialog]")) return;
      const forward =
        e.key === "PageDown" || e.key === "."
          ? true
          : e.key === "PageUp" || e.key === ","
            ? false
            : null;
      if (forward === null) return;
      e.preventDefault();
      const index = links().indexOf(document.activeElement as HTMLElement);
      if (turnRef.current(forward)) pending.current = Math.max(index, 0);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // One tab stop per binder: the pending pocket after a turn, else the first card.
  useLayoutEffect(() => {
    const all = links();
    const index = Math.min(pending.current ?? 0, all.length - 1);
    all.forEach((l, i) => (l.tabIndex = i === index ? 0 : -1));
    if (pending.current !== null) {
      pending.current = null;
      requestAnimationFrame(() => all[index]?.focus());
    }
    if (page !== firstPage.current)
      setAnnouncement(`Page ${page} of ${pageCount}`);
  }, [page, pageCount, base]);

  return (
    <div
      ref={container}
      className="touch-pan-y"
      onFocus={(e) => {
        const all = links();
        if (!all.includes(e.target)) return;
        all.forEach((l) => (l.tabIndex = l === e.target ? 0 : -1));
      }}
      onKeyDown={(e) => {
        if (!GRID_KEYS.includes(e.key) || e.ctrlKey || e.altKey || e.metaKey)
          return;
        const all = links();
        const index = all.indexOf(e.target as HTMLElement);
        if (index < 0) return;
        const grids = [
          ...(container.current?.querySelectorAll("ol") ?? []),
        ].filter((g) => g.checkVisibility());
        const cols = grids[0]
          ? getComputedStyle(grids[0]).gridTemplateColumns.split(" ").length
          : 3;
        const sizes = grids.map((g) => all.filter((l) => g.contains(l)).length);
        const next = gridMove(e.key, index, cols, sizes);
        e.preventDefault();
        if (next !== null) all[next].focus();
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch")
          start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerCancel={() => (start.current = null)}
      onPointerUp={(e) => {
        const from = start.current;
        start.current = null;
        if (!from) return;
        const dx = e.clientX - from.x;
        if (
          Math.abs(dx) < MIN_SWIPE ||
          Math.abs(dx) < Math.abs(e.clientY - from.y)
        )
          return;
        turnTo(dx < 0);
      }}
    >
      {children}
      <Typography as="p" aria-live="polite" className="sr-only">
        {announcement}
      </Typography>
    </div>
  );
}

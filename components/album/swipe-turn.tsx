"use client";

import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { pageHref, type Turns } from "./page-nav";

const MIN_SWIPE = 50;

export function SwipeTurn({
  setId,
  turns,
  children,
}: {
  setId: string;
  turns: Turns;
  children: ReactNode;
}) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="touch-pan-y"
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
        const forward = dx < 0;
        const spread = window.matchMedia("(min-width: 1280px)").matches;
        const target = forward
          ? spread
            ? turns.spreadNext
            : turns.next
          : spread
            ? turns.spreadPrev
            : turns.prev;
        if (target !== null)
          router.push(pageHref(setId, target), {
            scroll: false,
            transitionTypes: [forward ? "page-forward" : "page-back"],
          });
      }}
    >
      {children}
    </div>
  );
}

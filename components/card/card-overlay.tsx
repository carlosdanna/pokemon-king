"use client";

import { cn } from "cn";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { AlbumCard, SetInfo } from "@/lib/album";
import { CardPanel } from "./card-panel";
import { zoomedWidth } from "./card-view";
import { ZoomedCard } from "./zoomed-card";

const DESKTOP = "(min-width: 1024px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * The zoom overlay over the album (intercepted /cards/[id]); closing goes Back.
 * A native <dialog> rendered in place, not a portalled Base UI Dialog: portals
 * mount a commit late, outside the navigation's transition, so the card could
 * not pair with its tile for the morph (D-033).
 */
export function CardOverlay({ card, set }: { card: AlbumCard; set: SetInfo }) {
  const router = useRouter();
  // State, not a ref: the Drawer's portal reads its container before a ref is set.
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  // null until hydrated; the overlay only opens on client navigation anyway.
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => null,
  );
  // Esc can reach both the Drawer and the dialog; go Back once per opening.
  const closing = useRef(false);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  };

  // showModal traps focus, makes the album inert and turns Esc into `cancel`.
  // Opening in the ref keeps it in the navigation's commit, so the card is
  // visible when the morph snapshots it.
  const attach = useCallback((element: HTMLDialogElement | null) => {
    if (element && !element.open) element.showModal();
    setDialog(element);
  }, []);
  // Next keeps a left route mounted but hidden (<Activity>): close it then,
  // reopen it if the route is shown again.
  useLayoutEffect(() => {
    closing.current = false;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, [dialog]);

  // Esc, click outside and browser Back all unmount the overlay, so focus
  // returns here; the tile remounts during the commit, hence the frame wait.
  useEffect(
    () => () => {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(
            `[data-card-link="${CSS.escape(card.id)}"]`,
          )
          ?.focus(),
      );
    },
    [card.id],
  );

  return (
    // Clicks on the dialog itself (not its content) are outside the card and panel.
    <dialog
      ref={attach}
      aria-label={card.name}
      data-card-id={card.id}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-transparent p-4 backdrop:bg-black/40 backdrop:backdrop-blur-xs lg:p-8"
    >
      <div className="relative mx-auto grid max-w-5xl items-start gap-8 lg:mt-[8dvh] lg:grid-cols-2 lg:rounded-xl lg:bg-popover lg:p-8 lg:ring-1 lg:ring-foreground/10">
        <ZoomedCard
          card={card}
          className={cn(
            "mx-auto",
            zoomedWidth,
            "max-lg:max-w-[min(20rem,calc(50dvh*245/337))]",
          )}
        />
        {desktop && <CardPanel card={card} set={set} />}
        <Button
          variant="secondary"
          size="icon"
          aria-label="Close"
          onClick={close}
          className="absolute -top-2 right-0 rounded-full lg:top-3 lg:right-3"
        >
          <XIcon aria-hidden />
        </Button>
      </div>
      {desktop === false && dialog && (
        // Swipe or Esc (focus is often inside it); not focus-out or outside presses,
        // which the route change itself and the dialog cause.
        <Drawer
          open
          modal={false}
          onOpenChange={(open, { reason }) =>
            !open && (reason === "swipe" || reason === "escape-key") && close()
          }
        >
          <DrawerContent aria-label={`${card.name} details`} container={dialog}>
            <div className="max-h-[45dvh] overflow-y-auto p-4">
              <CardPanel card={card} set={set} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </dialog>
  );
}

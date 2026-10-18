import { useSyncExternalStore } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "favourites";
const NOTICE_KEY = "favourites-local-notice";
const EMPTY: ReadonlySet<string> = new Set();

let ids = EMPTY;
let synced = false;
let ready: Promise<void> | null = null;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function set(next: ReadonlySet<string>) {
  ids = next;
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {}
  listeners.forEach((l) => l());
}

function readLocal(): string[] {
  try {
    const value: unknown = JSON.parse(storage()?.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function noticeOnce() {
  try {
    if (storage()?.getItem(NOTICE_KEY)) return;
    storage()?.setItem(NOTICE_KEY, "1");
  } catch {}
  toast("Favourites are saved on this device only: sync is not set up.");
}

/** The local mirror shows at once; the server's set replaces it when sync is on (D-042). */
async function start() {
  set(new Set(readLocal()));
  try {
    const res = await fetch("/api/favourites");
    if (!res.ok) return;
    const data: { synced: boolean; ids: string[] } = await res.json();
    if (data.synced) {
      synced = true;
      set(new Set(data.ids));
    } else noticeOnce();
  } catch {
    // shortcut: offline loads keep the local mirror and don't sync later pins; retry on reload.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ready ??= start();
  return () => {
    listeners.delete(listener);
  };
}

const flip = (from: ReadonlySet<string>, id: string, on: boolean) => {
  const next = new Set(from);
  if (on) next.add(id);
  else next.delete(id);
  return next;
};

/** Optimistic: the pin shows at once and rolls back if the server refuses. */
export async function toggleFavourite(id: string) {
  const pin = !ids.has(id);
  set(flip(ids, id, pin));
  // A pin made before the first load must not be lost when the server set arrives.
  await ready;
  if (ids.has(id) !== pin) set(flip(ids, id, pin));
  if (!synced) return;
  try {
    const res = await fetch("/api/favourites", {
      method: pin ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    set(flip(ids, id, !pin));
    toast.error("Couldn't save the pin. Try again.");
  }
}

export const useFavourites = () =>
  useSyncExternalStore(
    subscribe,
    () => ids,
    () => EMPTY,
  );

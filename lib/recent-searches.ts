import { useSyncExternalStore } from "react";

const KEY = "recent-searches";
const MAX = 5;

function raw() {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

const parse = (value: string): string[] => {
  try {
    const list: unknown = JSON.parse(value);
    return Array.isArray(list)
      ? list.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
};

/** Newest first, deduped ignoring case, at most 5 (D-044). */
export function saveSearch(q: string) {
  const query = q.trim();
  if (!query) return;
  const list = parse(raw()).filter(
    (s) => s.toLowerCase() !== query.toLowerCase(),
  );
  try {
    localStorage.setItem(KEY, JSON.stringify([query, ...list].slice(0, MAX)));
  } catch {}
}

const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};

export const useRecentSearches = () =>
  parse(useSyncExternalStore(subscribe, raw, () => "[]"));

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Typography } from "@/components/ui/typography";
import { DEFAULT_SEARCH, fold, queryWords, searchHref } from "@/lib/search";

const OPEN = "open-command-palette";

/** For triggers outside the shortcut listener, such as the header button. */
export const openPalette = () => window.dispatchEvent(new Event(OPEN));
export const onOpenPalette = (open: () => void) => {
  window.addEventListener(OPEN, open);
  return () => window.removeEventListener(OPEN, open);
};

/**
 * Cards come ranked from the server, so they always pass with one score and
 * keep that order; pages and sets need every query word in their name (D-048).
 */
const filter = (value: string, search: string) =>
  /^(card|search) /.test(value) ||
  queryWords(search).every((w) => fold(value).includes(w))
    ? 1
    : 0;

type Found = { id: string; name: string; number: string; set: string };

const PAGES = [
  { name: "Home", href: "/" },
  { name: "Album", href: "/album" },
  { name: "Browse", href: "/browse" },
  { name: "Pinned", href: "/pinned" },
];

/** Ctrl/Cmd + K: jump to a page, set or card by name (D-047). */
export function CommandPalette({
  open,
  onOpenChange,
  sets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sets: readonly { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<Found[]>([]);
  // cmdk's highlighted item; controlled so late card results can take it over.
  const [selected, setSelected] = useState("");
  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) return;
    const controller = new AbortController();
    // Wait for a pause in typing, not a request per keystroke (D-048).
    const timer = setTimeout(
      () =>
        fetch(`/api/cards?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
          .then((r) => (r.ok ? (r.json() as Promise<Found[]>) : []))
          .then((found) => {
            setCards(found);
            // "Search for" was the only match while cards loaded; prefer the first card.
            setSelected((value) =>
              found[0] && value.startsWith("search ")
                ? `card ${found[0].name} ${found[0].id}`
                : value,
            );
          })
          .catch(() => {}),
      250,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        // Each opening starts empty.
        if (!next) setQuery("");
        onOpenChange(next);
      }}
      title="Jump to"
      description="Find a page, set or card by name"
    >
      <Command value={selected} onValueChange={setSelected} filter={filter}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Go to a set or card…"
        />
        <CommandList>
          <CommandEmpty>
            <Typography variant="small" color="muted">
              Nothing found.
            </Typography>
          </CommandEmpty>
          <CommandGroup heading="Go to">
            {PAGES.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                <Typography as="span" variant="small">
                  {p.name}
                </Typography>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Sets">
            {sets.map((s) => (
              <CommandItem
                key={s.id}
                value={`set ${s.name} ${s.id}`}
                onSelect={() => go(`/album/${s.id}`)}
              >
                <Typography as="span" variant="small">
                  {s.name}
                </Typography>
              </CommandItem>
            ))}
          </CommandGroup>
          {q.length >= 2 && (
            <CommandGroup heading="Cards">
              {cards.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`card ${c.name} ${c.id}`}
                  onSelect={() => go(`/cards/${c.id}`)}
                >
                  <Typography
                    as="span"
                    variant="small"
                    className="flex-1 truncate"
                  >
                    {c.name}
                  </Typography>
                  <Typography as="span" variant="caption">
                    {c.set} #{c.number}
                  </Typography>
                </CommandItem>
              ))}
              <CommandItem
                value={`search ${q}`}
                onSelect={() => go(searchHref(DEFAULT_SEARCH, { q }))}
              >
                <Typography as="span" variant="small">
                  Search for “{q}” on the search page
                </Typography>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

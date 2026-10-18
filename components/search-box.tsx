"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { saveSearch } from "@/lib/recent-searches";
import { DEFAULT_SEARCH, parseSearch, searchHref } from "@/lib/search";

const DEBOUNCE_MS = 300;

/**
 * Search by card name, set name, set code or number (D-048). On /search the
 * results follow the typing once it pauses; elsewhere Enter goes to /search.
 */
export function SearchBox() {
  const router = useRouter();
  const onSearch = usePathname() === "/search";
  const params = useSearchParams();
  const state = onSearch
    ? parseSearch(Object.fromEntries(params))
    : DEFAULT_SEARCH;
  // While typing your own text wins; on blur the URL does again (Back, clear filters).
  const [draft, setDraft] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (q: string) => {
    clearTimeout(timer.current);
    timer.current = undefined;
    const href = searchHref(state, { q });
    startTransition(() =>
      onSearch ? router.replace(href, { scroll: false }) : router.push(href),
    );
  };

  return (
    <form
      role="search"
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        saveSearch(draft ?? state.q);
        go(draft ?? state.q);
      }}
    >
      <InputGroup className="h-9 bg-background">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search by card name, set or number"
          placeholder="Card, set or number"
          value={draft ?? state.q}
          onChange={(e) => {
            const q = e.target.value;
            setDraft(q);
            if (!onSearch) return;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => go(q), DEBOUNCE_MS);
          }}
          onBlur={() => {
            // A pending search still runs; saved on Enter or blur, not per keystroke (D-044).
            if (timer.current && draft !== null) go(draft);
            saveSearch(draft ?? state.q);
            setDraft(null);
          }}
        />
      </InputGroup>
    </form>
  );
}

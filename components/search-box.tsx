"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DEFAULT_SEARCH, parseSearch, searchHref } from "@/lib/search";

/** Name search; results update as you type (D-038). */
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

  const go = (q: string) => {
    const href = searchHref(state, { q });
    startTransition(() =>
      onSearch ? router.replace(href, { scroll: false }) : router.push(href),
    );
  };

  return (
    <form
      role="search"
      className="w-full max-w-xs"
      onSubmit={(e) => {
        e.preventDefault();
        go(draft ?? state.q);
      }}
    >
      <InputGroup className="h-9 bg-background">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search cards by name"
          placeholder="Search cards"
          value={draft ?? state.q}
          onChange={(e) => {
            setDraft(e.target.value);
            go(e.target.value);
          }}
          onBlur={() => setDraft(null)}
        />
      </InputGroup>
    </form>
  );
}

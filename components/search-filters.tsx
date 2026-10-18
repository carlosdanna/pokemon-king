"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import {
  clearFiltersHref,
  hasFilters,
  KINDS,
  LEGAL_FORMATS,
  searchHref,
  SORTS,
  type Kind,
  type LegalFormat,
  type SearchState,
  type Sort,
} from "@/lib/search";

export type FilterOptions = {
  sets: { id: string; name: string }[];
  types: string[];
  rarities: string[];
};

const KIND_LABELS: Record<Kind, string> = {
  pokemon: "Pokémon",
  trainer: "Trainer",
  energy: "Energy",
};
const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Typography
      as="label"
      variant="caption"
      color="default"
      className="flex flex-col gap-1"
    >
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 max-w-44 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </Typography>
  );
}

export function SearchFilters({
  state,
  options,
}: {
  state: SearchState;
  options: FilterOptions;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const go = (href: string) =>
    startTransition(() => router.replace(href, { scroll: false }));
  const update = (patch: Partial<SearchState>) => go(searchHref(state, patch));
  // "" in a select means "any"; the toggles fall back to "any" when emptied.
  const any = <T,>(value: string) => (value || undefined) as T | undefined;

  return (
    <div className="flex w-full max-w-6xl flex-wrap items-end gap-3">
      <Select
        label="Set"
        value={state.set ?? ""}
        onChange={(v) => update({ set: any(v) })}
      >
        <option value="">Any set</option>
        {options.sets.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <Select
        label="Type"
        value={state.type ?? ""}
        onChange={(v) => update({ type: any(v) })}
      >
        <option value="">Any type</option>
        {options.types.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </Select>
      <Select
        label="Rarity"
        value={state.rarity ?? ""}
        onChange={(v) => update({ rarity: any(v) })}
      >
        <option value="">Any rarity</option>
        {options.rarities.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </Select>
      <Select
        label="Legal in"
        value={state.legal ?? ""}
        onChange={(v) => update({ legal: any<LegalFormat>(v) })}
      >
        <option value="">Any format</option>
        {LEGAL_FORMATS.map((f) => (
          <option key={f} value={f}>
            {capitalise(f)}
          </option>
        ))}
      </Select>
      <Select
        label="Sort by"
        value={state.sort}
        onChange={(v) => update({ sort: v as Sort })}
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {capitalise(s)}
          </option>
        ))}
      </Select>
      <ToggleGroup
        aria-label="Kind"
        variant="outline"
        size="sm"
        spacing={0}
        value={[state.kind ?? "any"]}
        onValueChange={([v]) =>
          update({ kind: v && v !== "any" ? (v as Kind) : undefined })
        }
      >
        <ToggleGroupItem value="any">
          <Typography as="span" variant="small" color="inherit">
            All kinds
          </Typography>
        </ToggleGroupItem>
        {(Object.keys(KINDS) as Kind[]).map((k) => (
          <ToggleGroupItem key={k} value={k}>
            <Typography as="span" variant="small" color="inherit">
              {KIND_LABELS[k]}
            </Typography>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup
        aria-label="Cards to show"
        variant="outline"
        size="sm"
        spacing={0}
        value={[state.owned ? "owned" : "all"]}
        onValueChange={([v]) => v && update({ owned: v === "owned" })}
      >
        <ToggleGroupItem value="owned">
          <Typography as="span" variant="small" color="inherit">
            Owned
          </Typography>
        </ToggleGroupItem>
        <ToggleGroupItem value="all">
          <Typography as="span" variant="small" color="inherit">
            All
          </Typography>
        </ToggleGroupItem>
      </ToggleGroup>
      {hasFilters(state) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go(clearFiltersHref(state))}
        >
          <Typography as="span" variant="small" color="inherit">
            Clear filters
          </Typography>
        </Button>
      )}
    </div>
  );
}

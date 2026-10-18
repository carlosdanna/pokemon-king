# Ash's Card Collection — Requirements Plan

Oct 17, 2026 · @Carlos Danna

## Overview

Build a fast, keyboard-first card album for Ash in Next.js + React + TypeScript, within a half-day budget (about 4 hours). The app must let him find any card in seconds by partial name, browse by set, type and rarity, open a shareable detail page, and keep pinned favourites on the homepage.

The guiding idea is "terminal speed, normal UI": every core task can be done without a mouse, but the interface stays a regular responsive web app. A full terminal-style interface is out of scope; it borrows only the keyboard model (shortcuts, a command palette, visible focus).

Constraints from the brief:

- React and TypeScript are required; other tools are free choice.
- Works on phone and laptop, is keyboard-usable, and handles loading and empty states.
- Search and filter state lives in the URL so a filtered view can be shared.
- Submission: a Vercel URL and a demo video, plus a public Git repo with a README (setup, approach, trade-offs, unimplemented features), as the brief asks.

## Tech stack

Next.js 16 (App Router) with React and TypeScript in strict mode, deployed to Vercel. Next.js 16.x is the current Active LTS line ([nextjs.org](https://nextjs.org/llms.txt)). The collection is read from the bundled `ash_collection.json` at build time, so the app does not depend on the live API at runtime.

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16, App Router | File-based routes, static generation of every card page, one-click Vercel deploy |
| Language | TypeScript, strict | Required by the brief; typed card model shared by server and client |
| Data | `ash_collection.json` loaded in a server module | Fast, offline-safe, no rate limits; detail pages pre-rendered with `generateStaticParams` |
| URL state | `nuqs` (or plain `useSearchParams`) | Typed, shareable query params for search, filters and sort |
| Search | In-memory filter on the client; Fuse.js only if fuzzy matching is needed | Collection is small enough to search instantly without a backend |
| Persistence | `localStorage` cache; favourites saved in Upstash Redis (Vercel Marketplace) through a route handler | Same favourites on laptop and phone; survive reload and restart |
| Styling | CSS Modules or Tailwind | Fast to write, responsive grid, visible focus styles |
| Accessible primitives | Radix UI Tabs and Dialog (or hand-rolled ARIA) | Correct keyboard behaviour for tabs and the command palette for free |
| Images | `next/image` with the API image URLs | Lazy loading and sizing; remote host configured in `next.config` |
| Testing | Vitest + Testing Library for filter logic and the grid keyboard hook | Covers the parts most likely to break |
| Login | One password in an environment variable (APP\_PASSWORD), checked by a server action; signed httpOnly session cookie; proxy.ts (Next.js 16's renamed middleware) sends signed-out visitors to /login | Simple: no accounts, database table or auth library |

The live [Pokémon TCG API](https://docs.pokemontcg.io) fills one gap: the JSON has no set names. Its constraints make it fit for a one-off script, not a runtime dependency.

| Constraint | Detail | Effect on the plan |
| --- | --- | --- |
| Deprecated | API marked deprecated; new account registration closed; existing keys work until 1 March 2027; docs point to Scrydex ([docs](https://docs.pokemontcg.io/api-reference/sets/search-sets)) | No key can be obtained, and the endpoint may disappear; never call it at runtime |
| Rate limit without a key | 1,000 requests a day, 30 a minute ([docs](https://docs.pokemontcg.io/getting-started/rate-limits)) | Fine for one call; too low to fetch 1,644 cards one by one |
| Rate limit with a key | 20,000 a day | Not available: registration is closed |
| `GET /v2/sets` | Up to 250 sets per page; returns id, name, series, release date, symbol and logo images | All sets fit in one request: one call covers all 121 set codes |
| Images | Card images on `images.pokemontcg.io` | Still a runtime dependency; placeholder on failure |

Decision: a script runs `GET /v2/sets` once and commits `sets.json` to the repo. The app reads only local files, so the reviewer can run it without network access to the API.

## Data model

`ash_collection.json` is a flat 2.6 MB array of 2,138 entries in the Pokémon TCG API v2 card shape, but only 1,644 are unique cards. The other entries are identical copies, so the app groups by `id` and shows a copy count.

| Finding | Value | Requirement it creates |
| --- | --- | --- |
| Entries / unique card ids | 2,138 / 1,644 (302 ids repeated, up to 7 copies, all identical) | Deduplicate by `id`; store `quantity`; show a ×N badge |
| Unique card names | 888 | Search by name returns several printings; detail page links to other printings of the same name |
| Card kinds (`supertype`) | 1,319 Pokémon, 574 Energy, 245 Trainer | Add a kind filter; Energy and Trainer get their own detail layout |
| Set data | No `set` object; set code only as the `id` prefix (`base3-53` → `base3`), 121 codes | Derive set code from `id`; fetch set names and release dates once at build time, or ship a small static map |
| Types | 11 values, Grass to Fairy; 819 cards have none (Trainers, Energy) | Type filter applies to Pokémon only; "No type" is not a filter option |
| Rarity | 13 values, mostly Common (1,176) and Uncommon (803); 2 cards have none | Order rarities by a fixed scale, not alphabetically; show "Unknown" for missing |
| Card `number` | Mostly digits, some codes such as `SV114`, `RC2`, `TG30` | Natural sort on `number`; keep it a string |
| Pokémon-only fields | `hp`, `attacks`, `weaknesses` missing on \~815 cards; `resistances` on 1,739; `abilities` present on 156 | Tabs hide or show "none" per card; Abilities and Rules shown when present |
| Legalities | `unlimited` on all; `expanded` 1,417; `standard` 663 | Legalities tab lists all three formats, marking absent ones as not legal |
| Prices | No `tcgplayer` or `cardmarket` data | Prices stay out of scope |
| Images | `small` and `large` on every card, all on `images.pokemontcg.io` | Grid uses `small`, detail uses `large`; one remote host to allow in `next.config` |

The browser never receives the full file. A build step writes a slim index (id, name, set code, number, rarity, types, supertype, small image, quantity), about 10 fields per card, for the grid and search; detail pages read the full card on the server.

## Functional requirements

Four routes cover the brief: home, collection, browse and card detail. Priority: **Must** ships in the half day, **Should** if time allows, **Could** goes to the README.

| ID | Requirement | Route | Priority |
| --- | --- | --- | --- |
| F1 | Homepage shows pinned favourites first, then a search box, recent searches, and entry points to browse by set, type and rarity with counts | `/` | Must |
| F2 | Persistent top navigation (Home, Collection, Sets) on every page, collapsing to a compact menu on phones | all | Must |
| F3 | Collection grid of 1,644 unique cards (×N badge for copies) with search by partial name, case-insensitive, results updating as he types | `/cards` | Must |
| F4 | Filters for set, kind (Pokémon, Trainer, Energy), type and rarity, combinable, with a clear-all action | `/cards` | Must |
| F5 | Search, filters and sort stored in the URL, e.g. `/cards?q=char&type=Fire&rarity=Rare` | `/cards` | Must |
| F6 | Sort by name, set, number or rarity | `/cards` | Should |
| F7 | Browse page listing owned sets, types and rarities with card counts; each links to a pre-filtered grid | `/browse` | Should |
| F8 | Card detail page with image, name, set, number, rarity, HP and types, plus tabs: Attacks, Weaknesses & resistances, Legalities | `/cards/[id]` | Must |
| F9 | Active detail tab kept in the URL (`?tab=attacks`) so the exact view can be sent to a friend | `/cards/[id]` | Should |
| F10 | Pin and unpin a card as favourite from the grid and the detail page; pins are saved on the server, so his laptop and phone see the same favourites | all | Must |
| F11 | Recent searches (last 5) saved and shown on the homepage | `/` | Could |
| F12 | Share button on detail page using the Web Share API, falling back to copy link | `/cards/[id]` | Could |
| F13 | Export and import favourites as a link, so they can move to his phone | `/` | Could |
| F14 | Login screen with one shared password; every page and the favourites API require a session; a log-out link in the navigation | /login | Must |

## Keyboard and mouse navigation

Ash can open the app, find a card, read every tab and pin it without touching the mouse. Mouse and touch keep working everywhere; keyboard is an equal path, not a separate mode.

Principles:

- Every interactive element is reachable with Tab in a logical order, with a clearly visible focus ring.
- Single-key shortcuts never fire while typing in an input, and are listed in a help overlay opened with `?`.
- Standard widget patterns follow the WAI-ARIA Authoring Practices: grid with roving tabindex, tabs, dialog with focus trap.
- A skip link jumps past the navigation to the main content.

| Key | Where | Action |
| --- | --- | --- |
| `/` | anywhere | Focus the search box |
| `Ctrl/Cmd + K` | anywhere | Open command palette: jump to a card, set, type or page by name |
| `g h` / `g c` / `g b` | anywhere | Go to Home / Collection / Browse |
| `?` | anywhere | Show the shortcut help overlay |
| `Esc` | search, palette, overlay | Clear search or close the overlay; second press returns focus to the grid |
| `↓` / `Enter` | search box | Move focus into the first result |
| Arrow keys | card grid | Move between cards; up and down jump a full row |
| `Home` / `End` | card grid | First / last card |
| `Enter` | card grid | Open the card detail |
| `f` | focused card, detail page | Pin or unpin favourite |
| `←` / `→` | detail tabs | Switch tab (Attacks, Weaknesses, Legalities) |
| `[` / `]` | detail page | Previous / next card in the current filtered list |
| `Backspace` or `Alt + ←` | detail page | Back to the list, focus restored on the card he came from |
| Enter | login screen | Submit the password; the field is focused on load, and errors are announced to screen readers |

Mouse and touch equivalents: click a card to open it, a pin icon on every card, clickable filter chips, swipe-free tabs on phone. Focus position and scroll are restored when returning from a detail page.

## Non-functional requirements

| ID | Area | Requirement |
| --- | --- | --- |
| N1 | Responsive | Usable from 360 px phone to desktop; grid reflows from 2 to 6 columns; no horizontal scroll |
| N2 | Accessibility | Semantic landmarks, labelled controls, alt text on card images, focus never lost after navigation, WCAG AA contrast |
| N3 | Loading | Skeleton cards while images load; `loading.tsx` for route transitions; image placeholders keep layout stable |
| N4 | Empty states | No results: show the query, suggest clearing filters. No favourites: explain how to pin (`f` or the pin icon). Unknown card id: friendly 404 with a link back |
| N5 | Errors | Broken image falls back to a placeholder with the card name; `error.tsx` boundary per route |
| N6 | Persistence | Favourites in Upstash Redis, shared by every device, mirrored with recent searches in `localStorage`, versioned key, safe parse with fallback to empty; no hydration mismatch (render pins after mount) |
| N7 | Shareability | Every view that matters is a URL: filtered grid, card detail, active tab. Reloading any URL restores the same view |
| N8 | Performance | Search results update within 100 ms of a keystroke; detail pages statically generated |
| N9 | Code quality | Typed card model, pure filter functions with unit tests, no `any`, lint and typecheck clean in CI |
| N10 | Security | Password and cookie secret only in environment variables, never in the repo; constant-time password check; generic error on a wrong password; session cookie lasts 30 days so Ash logs in once per device; the favourites route checks the session itself, not only the proxy |

## Plan, time budget and scope

About 4 hours of build time, in this order so a working app exists early and keyboard polish comes last.

1. Setup and data model (30 min): scaffold Next.js, inspect `ash_collection.json`, write the `Card` type and a server loader; run the set-names script and commit sets.json; push to the public repo and deploy the empty app to Vercel.
2. Collection grid and search (60 min): grid, partial-name search, set/type/rarity filters, all in the URL; empty state.
3. Card detail (30 min): static page per card, tabs for attacks, weaknesses and legalities; 404 for unknown ids.
4. Login, favourites, sync and homepage (60 min): login page, session cookie and proxy redirect;: `localStorage` cache plus a route handler saving pins to Upstash Redis, pin from grid and detail, homepage with pins and browse entry points.
5. Keyboard layer (40 min): `/` focus, grid arrow navigation, `f` to pin, tabs, `?` overlay; command palette only if time remains.
6. Polish and submission (20 min): phone check on the Vercel URL, loading skeletons, README, 2-minute demo video.

Deliverables:

- [ ] Deployed URL on Vercel
- [ ] Public Git repository
- [ ] README: setup (including the Redis and password environment variables), approach, trade-offs, unimplemented features, keyboard shortcut table
- [ ] 2-minute demo video showing login, a keyboard-only walkthrough and favourites syncing between laptop and phone
- [ ] Password sent to the reviewers with the submission, not committed to the repo

Out of scope, documented in the README instead: terminal-style UI theme, price data, adding or removing cards from the collection, user accounts and password reset (one shared password; favourites are one list for Ash), deck building, offline PWA mode.

## Risks and uncertainties

The biggest risk is time: a keyboard-first layer on top of every required feature is a lot for half a day. The mitigation is to ship Must items first and treat the command palette and extra shortcuts as stretch goals.

| Risk or uncertainty | Impact | Mitigation |
| --- | --- | --- |
| Half-day budget is tight for all Must items, the keyboard layer, favourites sync and a video | High | Strict build order; cut command palette, `[` `]` and recent searches first; list cuts in the README |
| The JSON has no set names, only 121 set codes inside card ids, yet set browsing is a core requirement | High | One-off `GET /v2/sets` call, result committed as `sets.json`; fall back to showing the raw code |
| Favourites sync needs hosted storage: Vercel's filesystem is not writable at runtime and Vercel KV no longer exists ([Vercel docs](https://vercel.com/docs/redis)) | Medium | Upstash Redis from the Vercel Marketplace, credentials injected as environment variables; `localStorage` fallback when Redis is not configured, so the repo still runs locally without it |
| One shared password is basic protection: no per-user accounts and no limit on login attempts | Medium | Enough for a demo: long random password, signed httpOnly cookie, limits noted in the README |
| Pokémon TCG API is deprecated: no new keys, existing keys end 1 March 2027, keyless limit 1,000 a day and 30 a minute | Medium | No runtime calls; the committed `sets.json` keeps the app working if the API goes away |
| Card images are hot-linked from `images.pokemontcg.io` and may disappear with the deprecated API | Medium | `next/image` remote pattern, lazy loading, placeholder with the card name on error |
| 2.6 MB of raw JSON would make the client bundle slow on a phone | Medium | Build-time slim index for the grid; full card data only on server-rendered detail pages |
| A third of the cards (Energy and Trainer) lack attacks, weaknesses and HP, so a Pokémon-shaped detail page looks broken for them | Medium | Detail tabs driven by available fields; Energy and Trainer layouts show rules text instead |
| Arrow-key navigation in a responsive grid needs the live column count, which changes with screen width | Medium | Read columns from the rendered layout (ResizeObserver or `getComputedStyle`), not a hard-coded number; unit test the index math |
| 1,644 tiles in one grid is heavy for keyboard scrolling and rendering | Medium | Paginate or virtualise the grid; keep arrow navigation working across page boundaries, or use `PageDown` to load the next page |
| Single-key shortcuts can clash with browser, screen reader or OS shortcuts | Medium | Disable in inputs, avoid modifier-free keys that browsers reserve, document all keys in the `?` overlay |
| Hydration mismatch: the server-rendered homepage and the `localStorage` cache can disagree on pins | Low | Redis is the source of truth; client cache only for instant display |
| Statically generating 1,644 detail pages lengthens every Vercel build | Low | Pre-render on demand (`dynamicParams`) instead of all at build, if build time exceeds a few minutes |
| Next.js App Router adds server/client boundary complexity versus a plain Vite + React SPA | Low | Keep it mostly static; client components only for search, grid and pins; justify the choice in the README |
| "The design must be your own" while using AI assistants | Low | Own the layout and interaction model in this plan; use AI for boilerplate and tests; review all generated code |
| Reviewers cannot see the app without the password | Low | Send the password with the submission; the demo video shows the app either way; README explains how to set a password locally |

Decisions:

- [x] Duplicate entries are copies Ash owns: group by `id` and show the quantity
- [x] Set names: one-off call to the deprecated API, committed as `sets.json`; no runtime calls
- [x] Submission: Vercel URL, public repo and demo video, as the brief asks
- [x] Favourites sync across devices through Upstash Redis on Vercel
- [x] A login screen with one shared password protects the whole app and the favourites

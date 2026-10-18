# Ash's Card Album — Claude Code Prompts

Oct 18, 2026 · @Carlos Danna

## How to use

Run Prompt 0 once to set up tracking, then one prompt per milestone, each in a fresh Claude Code session in plan mode. Read the plan Claude proposes, correct it, approve it, and let it build. Every prompt makes Claude log the start and end time and any decision it took, so the repo carries its own history from the first commit.

Both planning documents go into the repo from the start as Markdown, so Claude Code reads the same source you do:

| File | Content | Updated by |
| --- | --- | --- |
| `CLAUDE.md` | Project rules: stack, conventions, the logging rules below; read by Claude Code at the start of every session | You, rarely |
| `docs/requirements.md` | Export of the [requirements plan](requirements.md) | Frozen; changes go to the decision log |
| `docs/implementation-plan.md` | Export of the [implementation plan](implementation-plan.md); wins where the two plans disagree | Milestone checkboxes ticked as work lands |
| `docs/decisions.md` | Numbered decision log: date and time, decision, reason, alternatives | Claude, whenever a choice is made |
| `docs/worklog.md` | Timed trace: one row per session with start, end, duration, milestone, outcome, commit | Claude, at the start and end of every session |
| `docs/prompts.md` | This document, exported at M7 | You, at submission |

Rules for every session:

- Times come from the shell (`date '+%Y-%m-%d %H:%M %Z'`), never estimated.
- The plan's first step is logging the start; the last is logging the end, ticking the milestone's boxes and committing.
- One milestone per session; if a milestone runs over, close the session with a "partial" worklog row and resume with the resume prompt.
- Decisions that change either plan are logged before the code that depends on them.

The requirements plan's time budget ("about 4 hours", the flat `/cards` grid) is superseded by the implementation plan's album and milestones. The bootstrap prompt records that as a decision so the reviewer is not confused.

## Work so far

Planning took two sessions, about 1 hour 30 minutes in total, before any code. Times are Stockholm time (CEST) and mark when each step started; end times are approximate. Prompt 0 copies this table into `docs/worklog.md` as its first rows.

| Date | Start | Step | Outcome |
| --- | --- | --- | --- |
| 2026-10-17 | 10:50 | Requirements plan drafted from the assignment PDF | Scope, React + Next.js stack, keyboard and mouse navigation, risks |
| 2026-10-17 | 10:54 | Collection JSON analysed | 2,138 entries, 1,644 unique cards, no set names; Data model section added |
| 2026-10-17 | 11:34 | Submission and API review | Submission briefly changed to private and local; Pokémon TCG API found deprecated |
| 2026-10-17 | 11:42 | Submission reverted | Vercel, public repo and video restored; favourites sync moved to Upstash Redis |
| 2026-10-17 | 11:44 | Login added | One shared password, session cookie, `proxy.ts` redirect. Session ended about 11:50 (about 1 hour) |
| 2026-10-18 | 09:39 | Implementation plan drafted | Binder album, 3x3 pages and spreads, greyed unowned cards, card zoom, 8 milestones of about 7 hours |
| 2026-10-18 | 09:55 | Claude Code prompts prepared | This document; plans exported to Markdown. Session ended about 10:10 (about 30 minutes) |

## Decisions so far

Fifteen decisions were made during planning. Prompt 0 writes them to `docs/decisions.md` in this form; new ones continue from D-016.

| ID | Date, time | Decision | Reason | Alternatives rejected |
| --- | --- | --- | --- | --- |
| D-001 | 2026-10-17 10:50 | Next.js 16 App Router + React + TypeScript strict | Brief requires React and TypeScript; static pages and easy deploy | Vite SPA |
| D-002 | 2026-10-17 10:50 | Keyboard is an equal path to mouse for every core task | Personal goal: browse the whole collection with the keyboard alone | Terminal-style UI (kept out of scope) |
| D-003 | 2026-10-17 10:50 | Search, filters, sort, page and tab live in the URL | Brief: views must be shareable | Client-only state |
| D-004 | 2026-10-17 10:54 | Group duplicate entries by `id` into a quantity | Duplicates are identical; confirmed as copies Ash owns | One tile per entry |
| D-005 | 2026-10-17 10:54 | Browser gets a slim index, never the 2.6 MB JSON | Phone performance | Ship the full file |
| D-006 | 2026-10-17 11:34 | Pokémon TCG API used only by one-off scripts; results committed | API deprecated, no new keys, keys end 2027-03-01, keyless 30 requests a minute | Runtime API calls |
| D-007 | 2026-10-17 11:42 | Submit a Vercel URL, a public repo and a demo video | Matches the brief | Private, locally run submission (briefly chosen at 11:34) |
| D-008 | 2026-10-17 11:42 | Favourites sync across devices via Upstash Redis (Vercel Marketplace), `localStorage` mirror and fallback | Vercel has no writable filesystem; Vercel KV no longer exists | Local JSON file; `localStorage` only |
| D-009 | 2026-10-17 11:44 | Login with one shared password, signed httpOnly cookie, `proxy.ts` redirect | Protects favourites on a public URL; kept simple | User accounts; auth library; sync code |
| D-010 | 2026-10-18 09:39 | Binder album: one section per set, 3x3 pages in card-number order | Feels like a TCG album | Flat filtered grid |
| D-011 | 2026-10-18 09:39 | 3x3 at every width; two-page spread from 1280 px; URL names one page | Same page numbers and links on every device | Fewer cards per page on phones |
| D-012 | 2026-10-18 09:39 | Show unowned cards greyed out using full set lists fetched once | Album shows what is missing; zoom shows them in colour | Owned cards only |
| D-013 | 2026-10-18 09:39 | shadcn/ui as the component base | Radix keyboard behaviour; components live in the repo | Other kits |
| D-014 | 2026-10-18 09:39 | React `<ViewTransition>` for zoom and page turns; Motion for micro-interactions; react-parallax-tilt for holo glare | Native, works with route changes; plain-React tilt | react-pageflip (stretch only); pokemon-cards-css (GPL-3.0, inspiration only) |
| D-015 | 2026-10-18 09:55 | Both plans committed as Markdown; implementation plan wins where they differ; decision log and worklog kept from the first commit | Traceability for reviewers | Plans kept outside the repo |

## Prompt 0 · Bootstrap tracking

Before running it, keep the assignment PDF in a git-ignored private/ folder so it never reaches the public repo, and create an empty project folder with a `docs/` folder holding four files: decisions.md and worklog.md (sent with this document), plus the two plans exported as Markdown from their docs and renamed (`requirements.md`, `implementation-plan.md`, `decisions.md`, `worklog.md`), and put `ash_collection.json` in `data/`.

```text
We are starting a take-home assignment: a Pokémon TCG card album for "Ash", built with Next.js 16 (App Router), React and TypeScript, deployed to Vercel. Nothing is scaffolded yet.

Read these first:
- docs/requirements.md (requirements plan)
- docs/implementation-plan.md (implementation plan; it wins where the two disagree)
- docs/decisions.md (decision log D-001 to D-015, already seeded)
- docs/worklog.md (timed trace of the planning sessions, already seeded)
- data/ash_collection.json (2.6 MB; inspect its shape, do not read it whole)
- private/ (the assignment brief; add it to .gitignore and never commit it)

Plan the following, do not write application code yet:

1. Run `date '+%Y-%m-%d %H:%M %Z'` and add a worklog row for this session with that start time, milestone "Bootstrap".
2. Create CLAUDE.md at the repo root with:
   - Project summary in 3 lines and links to the docs above.
   - Stack and conventions: Next.js 16 App Router, TypeScript strict with no `any`, shadcn/ui, Tailwind, Motion, React <ViewTransition>, Vitest + Testing Library, pnpm.
   - Working rules: one milestone per session; start every session by logging the start time in docs/worklog.md from the shell clock; end every session by logging end time, duration, outcome and commit hash, ticking the milestone's checkboxes in docs/implementation-plan.md, and committing.
   - Decision rule: any choice that changes or adds to the plans (library, data shape, route, scope cut) gets a new numbered entry in docs/decisions.md (date and time from the shell, decision, reason, alternatives rejected) before the code that depends on it.
   - Never commit secrets; environment variables are documented in .env.example.
   - Accessibility and keyboard rules: every interactive element reachable by keyboard, visible focus, prefers-reduced-motion respected.
3. Check that docs/decisions.md and docs/worklog.md follow a consistent table format; fix formatting only, do not change their content. In docs/implementation-plan.md, replace the "embedded content" placeholder under Milestones (the export drops the diagram) with a numbered list of M0 to M7 and their time estimates from the Milestone details section.
4. Add decision D-016: the requirements plan's 4-hour budget and flat /cards grid are superseded by the implementation plan's album and milestones.
5. git init, a .gitignore for Next.js, and a first commit "docs: planning documents and tracking" containing only CLAUDE.md, docs/ and data/.
6. Log the end time, duration and commit hash in docs/worklog.md and amend the commit.

Show me the CLAUDE.md content in the plan before writing it.
```

Done when: the first commit holds only documents, and the worklog shows this session with real times.

## Milestone prompts

Each prompt assumes CLAUDE.md is in place, so the logging rules apply without repeating them; the first and last lines remind Claude anyway. Paste one per fresh session, in plan mode.

### M0 · Setup and deploy (plan: 30 min)

```plain
Milestone M0 from docs/implementation-plan.md. Follow the CLAUDE.md working rules: log the start time first.

Plan:
- Scaffold Next.js 16 (App Router, TypeScript strict, ESLint, Tailwind, pnpm) into the existing repo without overwriting docs/, data/, private/ or CLAUDE.md.
- shadcn init; add Button, Badge, Tabs, Sheet, Drawer, Dialog, Command, Toggle Group, Skeleton, Sonner.
- Install motion and react-parallax-tilt. Check the installed React version supports <ViewTransition> (React 19.3+); if not, log a decision with the workaround.
- next.config: remote image pattern for images.pokemontcg.io.
- Vitest + Testing Library with one passing smoke test; scripts for lint, typecheck, test.
- GitHub Actions workflow running lint, typecheck and test on push.
- .env.example listing APP_PASSWORD, SESSION_SECRET and the Upstash Redis variables (values empty).
- A placeholder home page saying "Ash's Card Album".
- Tell me the exact steps to create the public GitHub repo and link it to Vercel; wait for me to confirm the first deploy URL, then record it in the worklog.

Finish: tick M0 boxes, log end time and duration, commit "chore: scaffold app (M0)".
```

### M1 · Data pipeline (plan: 45 min)

```text
Milestone M1 from docs/implementation-plan.md (see its "Data changes" section). Follow CLAUDE.md: log the start time first.

Plan:
- scripts/fetch-sets.ts (run with tsx): read the set codes from the id prefixes in data/ash_collection.json (expect 121); call GET https://api.pokemontcg.io/v2/sets once to write data/sets.json; then for each set call /v2/cards?q=set.id:<code>&select=id,name,number,rarity,supertype,types,images&pageSize=250 (page 2 when needed) to write data/sets/<code>.json.
- No API key exists: stay under 30 requests a minute (about 2 s between calls), retry with backoff on 429/5xx, skip sets already on disk so the script can resume, and print a summary.
- lib/collection.ts (server-only): load the collection, group by id into quantity, merge with set lists into AlbumCard { id, name, number, rarity, supertype, types, image, owned, quantity }.
- Natural sort on card number ("SV114", "RC2" exist); pages of 9; getAlbumPage(setCode, page) and getSetSummaries() with owned / total counts.
- Unit tests: grouping (quantities up to 7), natural sort, paging edges, unowned cards.

Before running the fetch script, show me the request count and the expected run time. If the API is unreachable, stop and log a decision on the fallback (owned cards only).

Finish: tick M1 boxes, log end time, commit "feat: data pipeline and set lists (M1)".
```

### M2 · Album pages (plan: 75 min)

```text
Milestone M2 from docs/implementation-plan.md (see "Album design decisions"). Follow CLAUDE.md: log the start time first.

Plan:
- Routes: /album (set list with logo, series, owned / total) and /album/[set]?page=N.
- BinderPage: header with set logo and name, 3x3 sleeve-pocket grid, page number footer. Binder look: faint paper texture, pockets with a soft inner shadow, neutral colours so the card art leads.
- Layout: one page below 1280 px, a two-page spread (odd page left, even right) from 1280 px; ?page=N names one page and the spread includes its partner. Card size scales; the grid stays 3x3 at every width.
- CardTile: next/image with skeleton and an error placeholder (name and number); unowned = grayscale(1) at about 45% opacity; quantity > 1 shows a ×N badge top right; leave room for a pin marker top left.
- Page turns: previous / next buttons using Link transitionTypes ['page-forward'] / ['page-back'], a <ViewTransition> wrapper keyed by page with CSS rotateY page-flip keyframes around the spine (short slide on phones), and a prefers-reduced-motion fallback with no animation.
- Swipe to turn on touch devices.

Verify in a browser at 375, 1024 and 1440 px and describe what you saw. Log any visual decision that departs from the plan.

Finish: tick M2 boxes, log end time, commit "feat: binder album pages (M2)".
```

### M3 · Card zoom and side panel (plan: 60 min)

```text
Milestone M3 from docs/implementation-plan.md. Follow CLAUDE.md: log the start time first.

Plan:
- /cards/[id] full page, plus the intercepting route @modal/(.)cards/[id] so clicking a card in the album opens an overlay over the page with its own URL; Back closes it.
- Shared <ViewTransition name={`card-${id}`} share="morph" default="none"> on the tile and the zoomed card so it grows out of its pocket. Prefetch card links and render the overlay from data already loaded so the morph pairs.
- Zoomed card always in full colour, wrapped in react-parallax-tilt with glare; label "Not in collection" when unowned.
- Side panel on desktop, bottom Drawer on phones: name, set, number, rarity, copies owned, HP, types; Tabs for Attacks, Weaknesses & resistances, Legalities with the active tab in the URL (?tab=); Trainer and Energy cards show rules text instead; "none listed" for missing data.
- Close with Esc, click outside or Back; return focus to the card's pocket.
- Tests for the panel's handling of Pokémon, Trainer and Energy cards.

Finish: tick M3 boxes, log end time, commit "feat: card zoom and info panel (M3)".
```

### M4 · Search and filters (plan: 45 min)

```text
Milestone M4 from docs/implementation-plan.md and requirements F3 to F7. Follow CLAUDE.md: log the start time first.

Plan:
- Search box in the header: partial, case-insensitive name match, results as you type.
- /search results laid out as album pages (same BinderPage), filters for set, kind (Pokémon, Trainer, Energy), type and rarity (fixed rarity order), plus an Owned / All toggle defaulting to Owned.
- All state in the URL (q, set, kind, type, rarity, owned, page); choose nuqs or useSearchParams and log the choice.
- Empty state showing the query and a clear-filters button.
- Pure filter functions with unit tests.

Finish: tick M4 boxes, log end time, commit "feat: search and filters (M4)".
```

### M5 · Login and favourites (plan: 60 min)

```text
Milestone M5 from docs/implementation-plan.md and requirement F14. Follow CLAUDE.md: log the start time first.

Plan:
- /login page: one password field, autofocused; Enter submits; server action compares with APP_PASSWORD in constant time; on success set a signed httpOnly, secure, sameSite=lax cookie for 30 days (signed with SESSION_SECRET); generic error otherwise, announced to screen readers.
- proxy.ts (Next.js 16's renamed middleware) redirects signed-out requests to /login, excluding /login and static assets. Log-out link in the navigation.
- Favourites: route handler GET/POST/DELETE on a Redis set via @upstash/redis, checking the session itself. Client hook with optimistic updates and a localStorage mirror; when Redis env vars are missing, fall back to localStorage only and say so in the UI once.
- Pin toggle on tiles (top-left marker) and in the side panel.
- Homepage: pinned favourites first, then search, recent searches (last 5, localStorage) and set shortcuts.
- Tell me the steps to add Upstash Redis from the Vercel Marketplace and set the env vars; wait for my confirmation, then test sync between two browsers.

Finish: tick M5 boxes, log end time, commit "feat: login and synced favourites (M5)".
```

### M6 · Keyboard layer (plan: 45 min)

```text
Milestone M6 from docs/implementation-plan.md and the shortcut table in docs/requirements.md. Follow CLAUDE.md: log the start time first.

Plan:
- Roving tabindex across the 3x3 grid, continuing across both pages of a spread; arrow keys move, Home / End jump, Enter zooms.
- Read the column count from the rendered layout, not a constant; unit test the index maths.
- PageUp / PageDown and , / . turn pages; focus lands on the same pocket position.
- Global: / focuses search, f pins the focused or zoomed card, [ and ] move between cards while zoomed, Esc closes, g h / g a for Home / Album, ? opens the shortcut overlay. Single-key shortcuts never fire inside inputs.
- Ctrl/Cmd + K command palette (shadcn Command) to jump to a set or card by name. Stretch: skip and log the cut if over time.
- Focus ring drawn outside greyscale and transformed elements; announce page changes in a live region.

Verify by doing the whole demo walkthrough without a mouse and list anything that failed.

Finish: tick M6 boxes, log end time, commit "feat: keyboard navigation (M6)".
```

### M7 · Polish and submission (plan: 45 min)

The planning document left this prompt unfinished; this is the prompt that was run.

```text
Milestone M7 from docs/implementation-plan.md. Follow CLAUDE.md: log the start time first.

Plan:
- Check phone width on the Vercel URL, prefers-reduced-motion, contrast of badges and labels on greyed cards, and a Lighthouse accessibility pass.
- docs/prompts.md: I add this file myself; link it from the README.
- README: what it is, live URL, setup (pnpm, env vars from .env.example, running scripts/fetch-sets.ts), approach, library choices with reasons, trade-offs, features cut and why, keyboard shortcut table, and a "How this was built" section linking docs/decisions.md, docs/worklog.md and docs/prompts.md.
- Total the worklog: planning time, build time per milestone against the plan, overall total; put the summary at the top of docs/worklog.md and in the README.
- Write a 2-minute script for the demo video: login, album and page turns, zoom with side panel, keyboard-only run, a pin syncing to the phone.

Finish: tick M7 boxes, log end time, commit "docs: README and submission (M7)", and list what I still need to do by hand (record the video, send the password).
```

## Reusable prompts

Three short prompts cover the moments between milestones: closing early, recording a choice, and picking up where a session stopped.

### Close a session early

```text
Stop here. Following CLAUDE.md: run the tests, log the end time and duration in docs/worklog.md with outcome "partial", list what is done and what is left for this milestone in that row, leave unfinished checkboxes unticked, and commit with "wip:" in the message.
```

### Record a decision

```text
Record this as the next numbered decision in docs/decisions.md, using the shell clock for the date and time: <decision>. Reason: <why>. Alternatives rejected: <what else was considered>. If it changes docs/implementation-plan.md or docs/requirements.md, show me the edit to the plan before making it.
```

### Resume a milestone

```text
Resume milestone <Mx>. Read CLAUDE.md, the last three rows of docs/worklog.md, the latest decisions in docs/decisions.md and the unticked boxes for <Mx> in docs/implementation-plan.md. Log a new start time, then plan only the remaining work.
```

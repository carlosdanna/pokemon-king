# Decision log

Every choice that changes or adds to the plans gets a numbered entry here before the code that depends on it. Times are Stockholm time (CET/CEST) and, from D-016 on, come from the shell clock (`date '+%Y-%m-%d %H:%M %Z'`).

| ID | Date, time | Decision | Reason | Alternatives rejected |
| --- | --- | --- | --- | --- |
| D-001 | 2026-10-17 10:50 CEST | Next.js 16 App Router + React + TypeScript strict | Brief requires React and TypeScript; static pages and easy deploy | Vite SPA |
| D-002 | 2026-10-17 10:50 CEST | Keyboard is an equal path to mouse for every core task | Personal goal: browse the whole collection with the keyboard alone | Terminal-style UI (kept out of scope) |
| D-003 | 2026-10-17 10:50 CEST | Search, filters, sort, page and tab live in the URL | Brief: views must be shareable | Client-only state |
| D-004 | 2026-10-17 10:54 CEST | Group duplicate entries by `id` into a quantity | Duplicates are identical; confirmed as copies Ash owns | One tile per entry |
| D-005 | 2026-10-17 10:54 CEST | Browser gets a slim index, never the 2.6 MB JSON | Phone performance | Ship the full file |
| D-006 | 2026-10-17 11:34 CEST | Pokémon TCG API used only by one-off scripts; results committed | API deprecated, no new keys, keys end 2027-03-01, keyless limit 30 requests a minute | Runtime API calls |
| D-007 | 2026-10-17 11:42 CEST | Submit a Vercel URL, a public repo and a demo video | Matches the brief | Private, locally run submission (briefly chosen at 11:34) |
| D-008 | 2026-10-17 11:42 CEST | Favourites sync across devices via Upstash Redis (Vercel Marketplace), with a `localStorage` mirror and fallback | Vercel has no writable filesystem; Vercel KV no longer exists | Local JSON file; `localStorage` only |
| D-009 | 2026-10-17 11:44 CEST | Login with one shared password, signed httpOnly cookie, `proxy.ts` redirect | Protects favourites on a public URL; kept simple | User accounts; auth library; sync code |
| D-010 | 2026-10-18 09:39 CEST | Binder album: one section per set, 3x3 pages in card-number order | Feels like a TCG album | Flat filtered grid |
| D-011 | 2026-10-18 09:39 CEST | 3x3 at every width; two-page spread from 1280 px; the URL names one page | Same page numbers and links on every device | Fewer cards per page on phones |
| D-012 | 2026-10-18 09:39 CEST | Show unowned cards greyed out, using full set lists fetched once | Album shows what is missing; zoom shows them in colour | Owned cards only |
| D-013 | 2026-10-18 09:39 CEST | shadcn/ui as the component base | Radix keyboard behaviour; components live in the repo | Other component kits |
| D-014 | 2026-10-18 09:39 CEST | React `<ViewTransition>` for zoom and page turns; Motion for micro-interactions; react-parallax-tilt for holo glare | Native, works with route changes; plain-React tilt | react-pageflip (stretch only); pokemon-cards-css (GPL-3.0, inspiration only) |
| D-015 | 2026-10-18 09:55 CEST | Both plans committed as Markdown; implementation plan wins where they differ; decision log and worklog kept from the first commit | Traceability for reviewers | Plans kept outside the repo |
| D-016 | 2026-10-18 10:28 CEST | The implementation plan's binder album and milestones M0–M7 (about 7 h) supersede the requirements plan's 4-hour budget and flat /cards grid | Album design adopted on 2026-10-18 (D-010); one plan to build from avoids conflicting scope | Keep the 4-hour flat-grid build; merge the two plans into one document |
| D-017 | 2026-10-18 10:35 CEST | Each session appends its transcript to docs/transcripts.md at session end, rendered from the Claude Code session log by `scripts/transcript.py` | Traceability for reviewers (D-015); rendering from the log keeps messages word for word | Writing transcripts from memory; committing the raw session logs |
| D-018 | 2026-10-18 10:48 CEST | Keep shadcn's current default base, Base UI (`base-nova` style, `@base-ui/react`), instead of Radix | `shadcn init` now defaults to Base UI; it gives the same keyboard and focus behaviour D-013 relied on, and the default keeps the CLI on its main path | Forcing a Radix style; mixing both bases |

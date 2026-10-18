# Ash's Card Album

A binder-style Pokémon TCG card album for Ash, built from his collection (`data/ash_collection.json`).
Next.js 16 App Router + React + TypeScript, deployed to Vercel; one 3x3 album section per set, with unowned cards greyed out.
Keyboard is an equal path to the mouse, and every view is shareable through its URL.

## Docs

- [Requirements plan](docs/requirements.md)
- [Implementation plan](docs/implementation-plan.md): wins where the two plans disagree (D-015, D-016)
- [Decision log](docs/decisions.md)
- [Worklog](docs/worklog.md)
- `data/ash_collection.json`: a 2.6 MB array of 2,138 Pokémon TCG API v2 card objects. Inspect it with `jq` or a script, never read it whole, and never ship it to the browser (D-005).
- `private/`: the assignment brief. It is git-ignored; never commit it or quote it into committed files.

## Stack and conventions

- Next.js 16 App Router, React, TypeScript `strict`; no `any` (use `unknown` and narrow it)
- shadcn/ui components (in the repo), Tailwind CSS
- Animation: React `<ViewTransition>` for zoom and page turns, Motion (`motion/react`) for micro-interactions
- Tests: Vitest + Testing Library
- Package manager: pnpm only (`pnpm install`, `pnpm dlx`)

## Working rules

- One milestone (M0–M7 in the implementation plan) per session.
- Start of session: run `date '+%Y-%m-%d %H:%M %Z'` and add a row to docs/worklog.md with that start time and the milestone.
- End of session: run `date` again and fill in the end time, duration, outcome and the short commit hash (`git rev-parse --short HEAD`); tick the milestone's checkboxes in docs/implementation-plan.md; commit, then `git commit --amend --no-edit` to include the log.

## Decision rule

Any choice that changes or adds to the plans (library, data shape, route, scope cut) gets a new numbered entry in docs/decisions.md before the code that depends on it: ID, date and time from `date '+%Y-%m-%d %H:%M %Z'`, decision, reason, alternatives rejected.

## Secrets

Never commit secrets. Every environment variable is listed, with a placeholder value, in `.env.example`; real values live in `.env.local` (git-ignored) and in Vercel.

## Accessibility and keyboard

- Every interactive element can be reached and used by keyboard.
- Focus is always visible, including on greyed-out and zoomed cards.
- Respect `prefers-reduced-motion`: every animation has an instant fallback.

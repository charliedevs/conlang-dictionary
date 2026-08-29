# Conlang Dictionary

A web app for conlangers to build, organize, and share constructed-language lexicons and grammar.

## Stack

- Next.js 14 (App Router), TypeScript 5.4, React 18 — T3 Stack (`create-t3-app`)
- Drizzle ORM + PostgreSQL, Clerk auth, Tailwind CSS + shadcn/ui, TipTap rich text editor
- Sentry (error tracking), PostHog (analytics), Upstash (rate limiting)

## Project Structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — reusable UI (shadcn-based) and icons
- `src/server/` — server actions (`actions/`) and DB layer (`db/`)
- `src/hooks/` — data, layout, accessibility, and responsiveness hooks
- `src/lib/`, `src/utils/`, `src/types/` — shared helpers and types

## Commands

```bash
npm install       # Install deps (npm only — package-lock.json is the lockfile)
npm run dev        # Dev server on :3000
npm run lint       # ESLint
npm run build      # Production build
npm test           # Vitest, single run
npm run test:watch # Vitest, watch mode
npm run db:push    # Push src/server/db/schema.ts straight to Postgres (no migrations)
npm run db:studio  # Drizzle Studio DB browser
```

## Conventions

- Access env vars via `src/env.ts` (`@t3-oss/env-nextjs`), not `process.env` directly — it validates required vars at build time.
- Import app code with the `~/*` alias (maps to `src/*`), not relative paths across top-level dirs.

## Gotchas

- There is no `drizzle/migrations` folder. Schema changes in `src/server/db/schema.ts` are applied by running `db:push` directly against the database, with no migration history to roll back through.
- Any user-supplied rich text (TipTap/markdown content) must pass through `sanitize-html` before being rendered as HTML — this closed a prior XSS gap; never render raw user HTML.

## Out of Scope

- `src/server/db/schema.ts` — schema edits combine with `db:push` to change the live database with no rollback path. Propose changes and confirm before editing.

## Approval Required

- Running `npm run db:push` against the real database.
- `git push` or opening pull requests.

## Testing

Vitest covers pure logic. Colocate `*.test.ts` next to the file it tests (e.g. `src/lib/conlang-export/to-export-json.test.ts`) and write the failing test before the implementation (TDD) for any new pure function — serializers, parsers, validators, data transforms. Run `npm test` for a single pass or `npm run test:watch` while developing; `vitest.config.ts` resolves the `~/*` alias the same way `tsconfig.json` does.

Not everything gets a unit test yet — there's no harness for Next.js API routes, Server Components, DB-backed queries, or DOM-only glue (e.g. triggering a browser download). For that code, `npm run lint` and `npm run build` must both pass, and it must be manually verified in the browser. Prefer extracting the pure, testable part of a route/component (like a serializer) rather than leaving all of its logic untested inside the untestable shell.

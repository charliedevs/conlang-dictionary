# Implementation Plan: Clerk Hardening — Identity Decoupling & Production Cutover

## Context

conlangdictionary.com's live authentication runs on a Clerk **development** instance holding **478 real users**. Clerk documents development instances as capped at 100 users, warns that exceeding limits "can stop your app from being able to sign up or log in users," and states plainly that user data **cannot be transferred between instances**. The production instance exists but has no integrations configured and zero users.

Worse, `conlangs.ownerId` stores raw Clerk user IDs. A production instance mints entirely new IDs, so a naive cutover orphans every conlang from its owner — the exact outcome that must not happen.

This plan gets the 478 identities into our own database keyed by an ID we control, upgrades the SDK off deprecated APIs, and then cuts over to a free production instance where existing users sign in with the same account and simply find their conlangs. Total cost: $0. Full detail lives in `SPEC.md`.

## Key discoveries from exploration

| Discovery | Consequence |
|---|---|
| `node` v22.22.2 runs `.ts` directly (type stripping on by default) and supports `--env-file` | Migration scripts need **no new dependency**. Run as `node --env-file=.env.local scripts/foo.ts` |
| `.env` and `.env.local` share one Neon host; only `TABLE_PREFIX` differs (prod `conlang-dictionary_`, local `test_conlang-dictionary_`) | Free full-dress rehearsal on throwaway tables — and one mistyped env var is the single most dangerous command here |
| `.env` has **no** `TABLE_PREFIX`; `src/env.js` requires it | Local `db:push` fails closed rather than silently hitting production. Preserve this property |
| 25 `auth()` call sites across 10 files | The v6 async migration is broad but mechanical |
| `/api/users` is the **only** `clerkClient` site, is unauthenticated, and resolves any Clerk ID to a name + avatar | Replacing it with a DB join kills the deprecation, closes a data leak, and removes Clerk from the client |
| PostHog uses the Clerk ID as `distinctId` (`queries.ts`, `_analytics/provider.tsx`) | Identity continuity breaks at cutover unless aliased |
| `middleware.ts` protects `/admin` with `role: "org:admin"` | Depends on Clerk **Organizations**, which must be re-enabled on the production instance or `/admin` breaks |

## Architecture decisions

1. **Expand only — never contract during cutover.** Add `ownerUserId` (uuid) alongside `ownerId`; migrate reads/writes; leave `ownerId` frozen as recovery data. Dropping columns is a separate approval, weeks later. `db:push` has no rollback path (per CLAUDE.md), so nothing destructive happens near the risky moment.
2. **At cutover, exactly one column changes: `users.clerkUserId`.** 478 rows, one table. No rewrite of production conlang data at the most dangerous point. This is the property that makes the whole plan safe.
3. **Rehearse everything on `test_conlang-dictionary_` first**, then repeat identical commands against production with per-command approval.
4. **Risk lives in pure functions.** All link/create/conflict decisions go in `src/lib/auth/`, TDD'd per CLAUDE.md, taking plain data and returning discriminated unions rather than throwing.
5. **Attribution moves to the DB.** `users` stores `displayName`/`imageUrl`, refreshed on each sign-in. Slightly staler than live Clerk data, but it survives Clerk outages and deleted Clerk accounts.
6. **PostHog `distinctId` switches to `users.id`** (stable forever) with a one-time `$create_alias` from the old Clerk ID.

---

## Phase 0 — Safety net (do first; no schema changes)

Nothing here touches the database or the app. It exists purely to get 478 identities out of an instance we cannot export from later.

### Task 0.1 — Clerk identity export script
- `scripts/export-clerk-users.ts`: pages `GET /v1/users?limit=100&offset=N` until exhausted; writes a timestamped JSON snapshot to `./backups/`.
- Captures per user: Clerk ID, primary email, **email verification status**, username, full name, image URL, and attached OAuth providers.
- Read-only against Clerk. No writes anywhere. Supports `--dry-run` (counts only).
- Add `backups/` to `.gitignore` — the file contains 478 email addresses.

**Acceptance:** snapshot exists; count is 478 (± recent signups); every record has a non-null email; provider breakdown printed.
**Verification:** `node --env-file=.env.local scripts/export-clerk-users.ts --dry-run`, then the real run; `jq` the output for null emails.
**Blocked on:** Bash permission rules for reading `.env.local` and reaching `api.clerk.com`.

> **The provider breakdown answers an open question from SPEC.md** — if a meaningful share signed up via Apple, we confirm before dropping it that their relay email is what we hold.

### ✋ Checkpoint 0
- [ ] Snapshot committed to `./backups/` (gitignored) and copied somewhere off this machine
- [ ] Provider breakdown reviewed — Apple share understood

---

## Phase 1 — SDK upgrade (M1)

Mechanical, invisible to users, and touches the same call sites Phase 2 will — hence first.

### Task 1.1 — `@clerk/nextjs` 5.7.5 → 6.39.6
Run `npx @clerk/upgrade`, then hand-verify every site. **Pin exactly** — do not leave a caret range on the auth dependency. v7 requires Next 15.2+ and is out of reach on Next 14.

| Pattern | Change | Representative files |
|---|---|---|
| `auth()` → `await auth()` | 25 sites, callers become `async` | `src/server/queries.ts`, `src/server/mutations.ts`, `src/server/actions/*.ts` |
| `conlang.ownerId === auth().userId` | `await auth()` first; these are Server Components | `src/app/lang/[id]/page.tsx:124`, `lexicon.tsx:67`, `grammar.tsx:15` |
| `auth().protect()` → `await auth.protect()` | note: `protect` moves onto `auth` | `src/middleware.ts:8,11` |
| `clerkClient.users` → `(await clerkClient()).users` | the deprecation you reported | `src/app/api/users/route.ts:29` |

**Acceptance:** zero Clerk deprecation warnings in browser *and* server console; sign-in works; `/dashboard` reachable; `/admin` still rejects non-admins; `/api/users` unchanged in behaviour.
**Verification:** `npm run lint && npm run build && npm test`, then manual browser pass.

### Task 1.2 — Environment hygiene
- Move `NEXT_PUBLIC_CLERK_*` and `CLERK_SECRET_KEY` into `src/env.js` with zod validation (CLAUDE.md requires env access go through it; Clerk vars currently bypass it).
- Replace deprecated `AFTER_SIGN_IN_URL`/`AFTER_SIGN_UP_URL` with the **`FALLBACK_REDIRECT_URL`** variants — fallback, not force, so signing in doesn't yank a user off the conlang page they were reading. Note `.env.local` currently uses `FORCE_`; that inconsistency gets fixed.

### Task 1.3 — Upgrade cadence in CLAUDE.md
Short section: monthly `npm outdated`; read `clerk/javascript`'s `packages/nextjs/CHANGELOG.md` before any Clerk bump; treat deprecation warnings as bugs. **Record the v7-needs-Next-15 blocker** so it isn't rediscovered the hard way.

### ✋ Checkpoint 1
- [ ] Lint, build, full test suite green
- [ ] Zero deprecation warnings
- [ ] Manual auth pass complete — commit and deploy before starting Phase 2

---

## Phase 2 — Identity decoupling, rehearsed on `test_` (M2)

All of Phase 2 runs against `TABLE_PREFIX=test_conlang-dictionary_`.

### Task 2.1 — Pure decision functions (TDD, tests written first)
- `src/lib/auth/resolve-user.ts` — given `{ clerkUserId, email, emailVerified }` plus candidate `users` rows matching that email, return `{ kind: "existing-by-clerk-id" | "reclaim-by-email" | "create-new" | "conflict" }`.
- `src/lib/auth/backfill-record.ts` — Clerk API user → `users` insert.

Tests (colocated, mirroring `src/lib/conlang-export/*.test.ts`): clerk-ID match beats email match; **unverified email never reclaims** (the account-takeover guard); two rows sharing an email returns `conflict`, never a silent pick; email normalised for case/whitespace; missing primary email; multiple emails; Apple private-relay addresses; absent username.

### Task 2.2 — Schema proposal *(ask-first per CLAUDE.md)*
New `users` table — `id` uuid PK, `clerkUserId` varchar unique **nullable** (the only Clerk-coupled column), `email`, `emailVerified`, `username`, `displayName`, `imageUrl`, timestamps; indexes on `clerkUserId` and `lower(email)`.

Expand-phase nullable uuid FKs, old columns untouched:

| Table | Existing | New |
|---|---|---|
| `conlangs` | `ownerId` | `ownerUserId` |
| `lexicalCategories` | `ownerId` | `ownerUserId` |
| `tags` | `createdBy` | `createdByUserId` |
| `feedback` | `userId` | `submittedByUserId` |

Present the exact diff, get approval, then `db:push` against `test_` only.

### Task 2.3 — Backfill script
`scripts/backfill-users.ts` — idempotent upsert by `clerkUserId` from the Phase 0 snapshot (not a fresh API call, so it's reproducible), then populate the new FK columns by joining old values against `users.clerkUserId`.
`scripts/audit-users.ts` — reports unmapped owners, unverified emails, duplicate emails.

**Hard gate:** zero unmapped rows in `conlangs`. Orphans in `tags`/`feedback` may stay null; an orphaned conlang blocks the phase.

### Task 2.4 — `getCurrentUser()` and call-site migration
- `src/server/auth/current-user.ts` — resolves `await auth()` → `users` row via `resolve-user.ts`, creating on first sight and refreshing `displayName`/`imageUrl`.
- Reads email from **Clerk session token claims** (dashboard → Sessions → Customize session token: `{"email": "{{user.primary_email_address}}", "email_verified": "{{user.email_verified}}"}`), falling back to `(await clerkClient()).users.getUser()` when absent — the fallback matters during cutover when old-instance tokens are still in flight.
- Convert the ~25 `const { userId } = auth()` sites to `const user = await getCurrentUser()` using `user.id` against the new columns.
- Switch PostHog `distinctId` to `user.id`.

### Task 2.5 — Replace `/api/users` with a DB join
Delete `src/app/api/users/route.ts`, `src/app/api/users/types.ts`, and `src/hooks/data/useUsers.ts`. Resolve owner display data server-side and pass it down as props to `recent-conlangs-showcase.tsx`, `dashboard/page.tsx`, and `dashboard/_components/conlang-table.tsx`.

This removes the last `clerkClient` call, closes the unauthenticated endpoint, and drops a client→Clerk round-trip.

### ✋ Checkpoint 2
- [ ] `npm run users:audit` on `test_`: zero unmapped conlangs
- [ ] Lint, build, tests green
- [ ] Manual: sign in, open a conlang, edit a word, create a conlang, view dashboard — owner names and avatars still render
- [ ] **No user-visible change.** This phase is correct only if it is invisible

---

## Phase 3 — Apply Phase 2 to production data

Identical commands, `TABLE_PREFIX=conlang-dictionary_`. **Per-command approval.**

- **3.1** `db:push` against production (approval required per CLAUDE.md) — additive columns only, no drops
- **3.2** Re-run the Clerk export (catch signups since Phase 0), then `backfill-users.ts` against production
- **3.3** `audit-users.ts` — **must** report zero unmapped conlangs before deploying app code
- **3.4** Deploy Phase 1 + 2 app changes to Vercel

### ✋ Checkpoint 3
- [ ] All 478 users in production `users` table with non-null emails
- [ ] Zero unmapped conlangs
- [ ] Live site verified: sign in, open a conlang, dashboard attribution correct
- [ ] **Soak for one week before Phase 4.** Do not compress this

---

## Phase 4 — Production cutover (M3)

Mostly dashboard work; see `SPEC.md` for the full runbook. Steps 1–5 change nothing live.

1. Register OAuth apps — **Google** (do first; likely how most of the 478 signed up), **GitHub**, **Discord**. All free. Skip Apple ($99/yr).
2. Configure the existing production instance; clone development settings.
3. Add `conlangdictionary.com` + DNS CNAMEs. Allow **48h** propagation; set records to **DNS only** if behind Cloudflare, or Clerk's validation fails.
4. Re-apply session-token claims from Task 2.4 — *easily forgotten, and the reclaim flow silently degrades without it.*
5. **Enable Organizations** on the production instance, or `middleware.ts`'s `org:admin` guard on `/admin` breaks.
6. Final Clerk export + backfill from the dev instance.
7. Swap `pk_test_`/`sk_test_` → `pk_live_`/`sk_live_` in Vercel Production. **This is the cutover.**
8. Set `authorizedParties: ["https://conlangdictionary.com"]` in `clerkMiddleware()`.
9. Emit PostHog `$create_alias` old-Clerk-ID → `users.id` on first post-cutover sign-in.
10. **Keep the development instance for 90 days.** It is the recovery source of truth.

### Reclaim flow (already built and tested in Task 2.1/2.4)
- Verified email matches exactly one `users` row → rewrite `clerkUserId`. Conlangs are simply there. No prompt, no email campaign.
- No match → new user.
- Unverified email or multiple matches → create new row, **never link**, log to Sentry, surface a quiet "Not seeing your conlangs?" link to the existing feedback modal.

Manual fallback: `users` holds email + old Clerk ID, so any unmatched user is one `UPDATE` away from recovery.

### ✋ Checkpoint 4
- [ ] A pre-existing account signs in via Google and sees its conlangs with **no manual step**
- [ ] A brand-new signup works end to end
- [ ] `/admin` still gated; sign-in emails no longer prefixed "development"
- [ ] Audit still clean; dev instance untouched

---

## Verification strategy

**Automated (`npm test`):** `resolve-user.ts` and `backfill-record.ts` only — per CLAUDE.md, pure logic is TDD'd and everything else is lint + build + manual browser checks. These two functions carry all the data-loss risk and none of the infrastructure, which is why they were carved out as pure.

**Per phase:** `npm run lint && npm run build && npm test` must pass before any checkpoint closes.

**Manual browser pass** (after Phases 1, 2, 3, 4): sign out → sign in → `/dashboard` renders owner names → open a public conlang → edit a word → create a conlang → `/admin` rejects a non-admin.

**Data verification:** `scripts/audit-users.ts` after every backfill; `npm run db:studio` to eyeball migrated rows; `--dry-run` before every script that writes.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Wrong `TABLE_PREFIX` hits production tables | **Critical** | Scripts print the resolved prefix and table count, then require typed confirmation for any non-`test_` prefix. `.env` lacking `TABLE_PREFIX` already fails closed — preserve that |
| Clerk enforces the 100-user cap mid-plan | **Critical** | Phase 0 runs first and depends on nothing. After it, no identity is unrecoverable |
| Reclaim links the wrong account | **Critical** | Verified emails only; `conflict` on ambiguity, never a silent pick; every link audit-logged |
| `db:push` drops a column (no rollback path) | High | Expand-only. Review the generated statement before every push. Old columns are never dropped in this plan |
| Session claims not configured on prod instance | High | Explicit runbook step + `getUser()` fallback so it degrades rather than fails |
| Organizations not enabled on prod → `/admin` breaks | Medium | Explicit runbook step 5 |
| Attribution names go stale | Low | Refreshed on every sign-in via `getCurrentUser()` |
| DNS propagation delays cutover | Low | Steps 1–5 are non-destructive; do them days ahead |

## Open items

- **Bash permission rules needed** for `.env.local` reads and `api.clerk.com` requests before Task 0.1 can run.
- **Carried forward from the previous plan:** Upstash Redis host `usw2-regular-polecat-31793.upstash.io` still fails DNS, so rate limiting is non-functional. Unrelated to this work, but it means the feedback modal used as the reclaim fallback has no working rate limit.
- On approval I'll write `tasks/plan.md` and `tasks/todo.md`, archiving the completed feedback-form versions rather than overwriting them.

---

*(Supersedes the completed Anonymous Feedback Form plan, archived as `tasks/plan-anonymous-feedback-form.md`. Its two unchecked items were environment blockers, not outstanding work: the Resend send was later confirmed working, and the Upstash DNS failure is carried forward under Open Items above.)*

---

## Phase 5 — Decommission dead accounts *(after cutover)*

**Depends on:** Phase 4 complete and soaked. Deliberately last: the orphaned rows are recovery
evidence, and deleting them before the cutover is proven would destroy the audit trail that shows
who owned what.

The audit already identifies the dead population precisely:

| Category | Count | Detail |
|---|---|---|
| Clerk accounts deleted, conlang left behind | 7 | 1 conlang each, 0–2 words: `Poltese`, `test lang`, `Mafcadian`, `Basseterre`, `deleted`, `Landes`, `Pfaaqlan` (public) |
| Live account with no email, unreachable after Apple is dropped | 1 | `user_2v84exbI7p1g5lWuXJeEdtYfaIC` — owns `Izaras` (1 word, private, last sign-in 2025-04-01) |
| Accounts owning no conlang at all | 39 | Harmless; listed for completeness |

`users.email` is `NOT NULL` precisely so the schema is not shaped around this population.

### Tasks
- [ ] **5.1** Define "dead" as a written rule — deleted-from-Clerk is unambiguous; decide separately
      whether prolonged inactivity counts, and if so what the threshold is and whether a warning
      email is sent first
- [ ] **5.2** Extend `scripts/audit-users.ts` with a `--dead` report listing every candidate and the
      exact conlangs, words, and lexical sections that would be destroyed
- [ ] **5.3** Take a full logical backup of the affected rows to `./backups/` **before** deleting
      anything — this is irreversible and there is no migration history to roll back through
- [ ] **5.4** Decide the disposition of orphaned *public* conlangs (`Pfaaqlan` is public and would
      disappear from the homepage showcase) — delete, or reassign to a tombstone owner
- [ ] **5.5** Delete in dependency order (lexical sections → words → lexical categories → conlang →
      user), inside a transaction, on `test_` first
- [ ] **5.6** Re-run the audit; confirm zero orphans and that no live user lost anything

### Boundaries
- **Never** delete without an explicit, separate approval naming the exact rows — this is the one
  genuinely irreversible operation in the whole plan and `git revert` cannot undo it.
- **Never** run 5.5 against production before it has run clean against `test_`.
- Deleting a Clerk account is **out of scope** — Clerk is not the source of truth for conlangs, and
  the development instance stays intact for 90 days regardless.

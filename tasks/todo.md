# Todo: Clerk Hardening — Identity Decoupling & Production Cutover

See [tasks/plan.md](plan.md) for context, architecture decisions, and risks. Spec: [SPEC.md](../SPEC.md).

*(Supersedes the completed Anonymous Feedback Form todo, archived as `tasks/todo-anonymous-feedback-form.md`.)*

**Guiding invariant:** at cutover, exactly one column changes — `users.clerkUserId`. Nothing in `conlangs` is ever rewritten. Old ownership columns are never dropped in this plan.

---

## Phase 0: Safety net — get 478 identities out of the dev instance

### Task 0.1: Clerk identity export script ✅
- [x] `scripts/export-clerk-users.ts` — pages `GET /v1/users?limit=100&offset=N` until exhausted
- [x] Captures per user: clerk id, primary email, **email verified**, username, display name, image url, OAuth providers, createdAt, lastSignInAt
- [x] Writes timestamped JSON snapshot to `./backups/`
- [x] `--dry-run` support (summary only, no file written)
- [x] `/backups/` added to `.gitignore` **before** the directory could exist

**Acceptance criteria:**
- [x] Snapshot exists: `backups/clerk-users-development-2026-08-30T21-51-17-501Z.json`, 478 users, matches Clerk's reported count exactly
- [x] 477 of 478 have a non-null email; the 1 exception is identified below
- [x] Provider breakdown printed and reviewed
- [x] Read-only against Clerk; writes nothing to the database
- [ ] Snapshot copied off this machine — **user action**

**Results:**

| Provider | Count | % |
|---|---|---|
| Google only | 428 | 89.5% |
| GitHub only | 27 | 5.6% |
| **Apple only** | **19** | **4.0%** |
| GitHub + Google | 3 | 0.6% |
| Apple + Google | 1 | 0.2% |

Reclaim readiness: **477 reclaimable** (verified email), **0 unverified**, **1 with no email**
(`user_2v84exbI7p1g5lWuXJeEdtYfaIC`), **0 shared email addresses** — so no `conflict` cases.

**Apple exposure (Apple SSO is being dropped in Phase 4):** 19 accounts can sign in *only* via
Apple today. 11 of those use an `@privaterelay.appleid.com` address and must reclaim via
**email code** to that relay address (Apple forwards it to their real inbox) — which is why
email code stays in the enabled set. The other 8 use a real address and can also reclaim via
Google/GitHub if it matches.

**Verification:**
- [x] `--dry-run` reported 478, matching the dashboard
- [x] Real run wrote 478 records; re-parsed the file: 0 missing clerk ids, 0 unverified, 1 null email
- [x] `git status` confirms `backups/` is untracked

---

### Task 0.2: Production ownership coverage check ✅
- [x] `scripts/audit-users.ts` — SELECT-only; prefix passed explicitly via `--prefix=` rather than
      read from `TABLE_PREFIX`, so touching production is always deliberate and visible
- [x] `--check-clerk` classifies unknown owners as deleted-from-Clerk vs still-live
- [x] Rehearsed on `test_conlang-dictionary_` (PASS) before running against production

**Production results:** 611 conlangs across 446 distinct owners; 39 of the 478 own no conlang.

| Category | Count | Assessment |
|---|---|---|
| Owners deleted from Clerk | 7 | **Pre-existing orphans** — already unreachable today, migration does not worsen them |
| Live owner with no email | 1 | **The only genuine blocker** |
| Owners with unverified email | 0 | — |
| Owners resolvable by verified email | 438 | Auto-reclaim |

The 7 deleted accounts own one conlang each, all 0–2 words: `Poltese`, `test lang`, `Mafcadian`,
`Basseterre`, `deleted`, `Landes`, `Pfaaqlan` (the last is public). Confirmed via Clerk API — all
return 404, i.e. the accounts were deleted, leaving `ownerId` values pointing at nothing.

The 1 blocker is `user_2v84exbI7p1g5lWuXJeEdtYfaIC` ("Shesin Chain"): an **Apple-only** account with
**zero** email addresses, `password_enabled: false`, last sign-in **2025-04-01**, owning `Izaras`
(1 word, private). Since Apple SSO is being dropped, this account cannot sign in after cutover by
any route — email, Google, GitHub or Discord. See the decision needed below.

**Verification:**
- [x] `--prefix=test_conlang-dictionary_` → PASS
- [x] `--prefix=conlang-dictionary_ --check-clerk` → 7 pre-existing orphans, 1 blocking

---

### Task 0.3: Capture OAuth provider ids ✅
- [x] Export now records `externalAccounts[].providerUserId` — the OAuth provider's own subject id
- [x] Re-exported: `backups/clerk-users-development-2026-08-30T22-16-23-902Z.json`, 478/478 captured
- [x] Documented as a **secondary, unverified** signal — verified email remains the primary key

Whether these survive a change of OAuth client credentials is **not established**: sources conflict
on whether Google's `sub` is globally unique per account or pairwise per client id. Capturing it is
free insurance; relying on it requires the empirical test added to Phase 4.

---

## Phase 1: SDK upgrade (M1)

### Task 1.1: `@clerk/nextjs` 5.7.5 → 6.39.6 ✅
- [x] Pinned to **exact** `6.39.6` (`--save-exact`), no caret. v7 not attempted — requires Next 15.2+
- [x] 19 `const { userId } = auth()` → `await auth()` in `queries.ts`, `mutations.ts`, `actions/*.ts`
- [x] `auth().protect()` → `await auth.protect()`; middleware callback made `async`
- [x] `clerkClient.users` → `(await clerkClient()).users` in `src/app/api/users/route.ts`
- [x] `Lexicon` and `Grammar` made `async` Server Components; `page.tsx:124` awaited

**Acceptance criteria:**
- [x] Zero Clerk deprecation warnings in browser and server console — the `clerkClient singleton`
      warning is gone. The only remaining Clerk warning is the *development keys* notice, which is
      the problem Phase 4 fixes
- [x] `/lang/1?view=lexicon` and `?view=grammar` render correctly (the async Server Component change)
- [x] `/dashboard` signed-out redirects to `/sign-in?redirect_url=...%2Fdashboard` — confirmed in server logs
- [x] `/api/users` behaviour unchanged (returns id/name/imageUrl)
- [x] Zero console errors

**Verification:**
- [x] `npm run lint` — no warnings or errors
- [x] `npm test` — 93 tests, 10 files, all pass
- [x] `npx tsc --noEmit` — clean
- [x] `npm run build` — succeeds, 18 pages generated
- [x] Browser pass on homepage, `/lang/1` both tabs, `/dashboard` redirect, `/sign-in`
- [ ] **Signed-in** browser pass — *user action, requires credentials I must not handle*

**Note:** `/admin` returns 404 because `src/app/admin` does not exist. The `org:admin` middleware
guard protects a route that has not been built. This makes Phase 4's "enable Organizations" step
**non-blocking** — worth doing for parity, but nothing breaks if it is missed.

---

### Task 1.2: Environment hygiene ✅
- [x] `CLERK_SECRET_KEY` (server, `startsWith("sk_")`) and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
      (client, `startsWith("pk_")`) added to **`src/env.js`** with zod validation
- [x] Sign-in/sign-up URL and fallback-redirect vars added as optional
- [x] `AFTER_SIGN_IN_URL` / `AFTER_SIGN_UP_URL` → `..._FALLBACK_REDIRECT_URL` in `.env`, `.env.example`
- [x] `.env.local`'s `FORCE_REDIRECT` inconsistency fixed → fallback
- [x] `.env.example` placeholders corrected to `pk_test_…` / `sk_test_…` so a fresh copy passes validation
- [x] Fail-closed property preserved: `.env` still has no `TABLE_PREFIX`

**Correction:** the env file is **`src/env.js`**, not `src/env.ts`. CLAUDE.md, SPEC.md, and the
plan all said `.ts`; all three have been corrected.

**Verification:**
- [x] `npm run build` passes (env validation runs at build time)
- [x] Server log confirms `redirect_url` is preserved on sign-in — fallback, not force

---

### Task 1.3: Upgrade cadence in CLAUDE.md ✅
- [x] "Dependency Cadence" section: monthly `npm outdated`, read Clerk's CHANGELOG before bumping,
      deprecation warnings are bugs
- [x] **v7 requires Next 15.2+** blocker recorded explicitly
- [x] Exact-pin rationale recorded
- [x] Added a Gotcha pointing at the 478-user development-instance situation

---

### Task 1.4: Fixes from code review ✅

Reviewed the full Phase 0 + 1 changeset across correctness, readability, architecture, security and
performance before committing. The v6 migration itself came back clean — no auth check was weakened,
added, or reordered. Findings were in the Phase 0 scripts and surrounding config.

**C1 — `/api/users` was an unauthenticated account-enumeration oracle.** Pre-existing, not introduced
here, but confirmed live: `GET /api/users?emailAddress=…` returned a real name and avatar for an
address with an account and `[]` for one without, letting anyone probe whether any email belongs to a
user. The route accepted `username` and `emailAddress` filters that **no caller has ever used** — so
they were pure attack surface. Removed both; lookup is now by opaque user id only, capped at
`MAX_USER_IDS` (100), with an empty list short-circuiting to `[]` before reaching Clerk (an unfiltered
`getUserList` returns an arbitrary page of the whole instance).

*Chosen over gating the route behind `auth()`*, which would have stripped owner attribution from the
homepage showcase for signed-out visitors. Verified: enumeration returns `[]`, id lookup still works,
empty list returns `[]` not 400 (a user with zero conlangs sends an empty array), 101 ids returns 400,
and the signed-out homepage still renders "by Charles Davis" / "by Charlie Davis".

**I1 — snapshot selection would silently pick the wrong file from Phase 3 onward.** `latestSnapshot()`
sorted filenames, but names are `clerk-users-{kind}-{timestamp}.json`, so *kind* sorts ahead of the
timestamp: once a `production` snapshot existed, an old one would shadow a newer `development` one and
the audit would produce a confidently wrong result. Now sorts on the recorded `exportedAt`, prints
which snapshot and instance it used, and accepts `--snapshot=<path>` to override. Verified with a
decoy: filename sort picks the wrong file, the fix picks the right one.

**I2 — snapshot was world-readable.** 478 email addresses at mode `0644`. Now written `0600` inside a
`0700` directory; existing snapshots chmodded. Verified on a fresh export.

**I3 — a short snapshot only produced a warning.** The script wrote the file and exited 0 on a count
mismatch. This is quietly dangerous: `audit-users.ts` compares production owners against the snapshot,
so a missing user is reported as "deleted from Clerk" — classified as a *non-issue* — and their conlang
silently becomes unrecoverable. The two failure modes conspired. Now refuses to write unless
`--allow-partial` is passed. Verified by simulating a short fetch: 477 vs 478 aborts with a clear
message and writes nothing.

**S1 — duplicate email addresses were printed to stdout.** Terminal scrollback and CI logs are the
wrong place for user email addresses. Now prints the account ids instead.

**Deliberately not changed:** 36 files elsewhere in the repo fail `prettier --check`. Only the 7 files
this change adds were formatted, to keep the commit free of unrelated churn.

---

### Checkpoint 1
- [x] Lint, build, typecheck, all tests green (141 after Task 0.4)
- [x] **No unit tests added for Phase 1, deliberately.** The diff is `await`/`async` mechanics plus
      zod env declarations — no new pure functions. Per CLAUDE.md this is lint + build + manual
      browser territory, and inventing tests for it would be theatre
- [x] Zero deprecation warnings
- [ ] Signed-in browser pass — **user action**
- [ ] Commit and deploy before starting Phase 2 — **approval required (CLAUDE.md gates `git push`)**

---

## Phase 2: Identity decoupling, rehearsed on `test_` (M2)

*All of Phase 2 runs with `TABLE_PREFIX=test_conlang-dictionary_`.*

### Task 2.1: Pure decision functions (TDD — tests first) ✅
- [x] `src/lib/auth/resolve-user.test.ts` written and confirmed **failing** first
- [x] `src/lib/auth/resolve-user.ts` → `existing` | `reclaim` | `create` | `conflict`
- [x] `src/lib/auth/backfill-record.test.ts` written and confirmed **failing** first
- [x] `src/lib/auth/backfill-record.ts` → `ExportedUser` → `UserRecord`

**Design refinement:** the plan said `backfill-record` maps a *raw Clerk API user*, but Task 2.3
reads from the Phase 0 snapshot and `src/lib/clerk-export/extract-user.ts` already owns the API
shape. Mapping `ExportedUser → UserRecord` instead avoids duplicating that parsing and keeps the
backfill reproducible from a file rather than dependent on Clerk being reachable.

**Acceptance criteria:**
- [x] Clerk-id match beats email match — a changed email must not fork an account
- [x] **Unverified email never reclaims** (the account-takeover guard); no email never reclaims
- [x] Two rows sharing an email → `conflict` with candidate ids, never a silent pick
- [x] Email normalised for case and whitespace on **both** sides
- [x] Supplied rows are re-filtered, not trusted — a caller's wrong collation or stale parameter
      cannot hand somebody another user's account
- [x] Blank clerk id fails closed to `conflict` rather than creating
- [x] Reclaim reports `previousClerkUserId` so every link can be audit-logged
- [x] No-email accounts still produce a `users` record — they own conlangs, and the ownership
      mapping is what keeps those attached to anything
- [x] `emailVerified` can never be true without an email
- [x] Over-long values are **reported** (`tooLong`), not silently truncated — a silent truncation
      would abort the whole backfill transaction at insert time

**Verification:**
- [x] `npm test` — 166 tests, 15 files (25 new)
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean
- [x] `prettier --check` clean on the new files
- [x] **Validated against the real 478-user snapshot:** 0 records exceed column limits, 0 missing
      clerk ids, 1 null email (the known Apple account), 477 verified
- [x] **Simulated the cutover end to end** — replayed all 478 users arriving with brand-new
      production clerk ids: **477 `reclaim`, 1 `create`, 0 `conflict`**. The single `create` is
      `user_2v84exbI7p1g5lWuXJeEdtYfaIC`, exactly the account already identified as unreachable

**Dependencies:** none — no schema, no permissions, no I/O

---

### Task 2.2: Schema proposal ✅ (approved and applied to `test_` only)
- [x] Exact diff presented and approved before editing `src/server/db/schema.ts`
- [x] New `users` table: `id` uuid PK, `clerkUserId` varchar **unique, nullable**, `email`
      varchar(320) **NOT NULL**, `emailVerified`, `username`, `displayName`, `imageUrl`, timestamps
- [x] Indexes on `clerkUserId` and on `lower(email)` — the latter matches how `resolveUser`
      compares, so a plain index would never be used
- [x] Additive nullable uuid FKs: `conlang.ownerUserId`, `lexicalCategories.ownerUserId`,
      `tag.createdByUserId`, `feedback.submittedByUserId`
- [x] **No drops, no retypes.** Every pre-existing Clerk-id column keeps its data as recovery evidence
- [x] `db:push` run against `TABLE_PREFIX=test_conlang-dictionary_` only

**Decision (user, mid-task): `email` is `NOT NULL`.** The first push had it nullable to accommodate
the single legacy Apple account with no address. That shapes the schema around dead data, so it was
changed and re-pushed. Consequence: that account gets no `users` row and its conlang stays unmapped
— accepted deliberately, and Phase 5 now covers decommissioning it.

*Risk accepted:* a future sign-in yielding no email would now hard-fail at account creation rather
than degrade. Empirically safe — Apple was the only provider producing a null email, all 27
GitHub-only users have one, and email-code sign-in has one by definition. `getCurrentUser()`
(Task 2.4) will fail loudly with a logged error rather than surfacing a raw constraint violation.

**Also reworked (driven by the NOT NULL decision):** `toUserRecord` now returns a discriminated
`{ ok: true, record } | { ok: false, clerkUserId, problems }` instead of a record with a nullable
email. A record the schema cannot accept is reported and skipped rather than aborting the whole
backfill transaction on a constraint violation. All problems are reported at once, not just the first.

**Verification:**
- [x] `information_schema` confirms `test_` has the `user` table (9 columns) and all four FK columns
- [x] `email` is `NOT NULL`, `clerkUserId` is nullable
- [x] **Production untouched** — no `conlang-dictionary_user` table, none of the four columns
      present, all 611 production conlangs still holding `ownerId`
- [x] Re-validated against the real snapshot: **477 accepted, 1 rejected** (`email is missing`,
      the known account)
- [x] `npm test` 166 pass · lint clean · `tsc --noEmit` clean · `npm run build` succeeds

**Dependencies:** Task 2.1

---

### Task 2.3: Backfill and audit scripts DONE
- [x] `src/lib/auth/plan-ownership-backfill.ts` (+ 6 tests, written failing first)
- [x] `scripts/snapshot.ts` shared loader so export/backfill/audit never disagree on which file is current
- [x] `scripts/backfill-users.ts` reads the snapshot, upserts `users`, fills the four FK columns
- [x] `scripts/audit-users.ts` extended to report the new columns, degrading to "column not present" where the schema has not been applied
- [x] `--dry-run` on both; a non-test prefix additionally requires `--allow-production`

**Deviation from plan:** the plan asked for a typed interactive confirmation on non-test prefixes.
Used an explicit `--allow-production` flag instead, so runbook commands stay reproducible and cannot
be satisfied by a stray keypress. Production is never the default either way.

**Results on `test_conlang-dictionary_`:**
- 477 records accepted, 1 rejected (`user_2v84exbI7p1g5lWuXJeEdtYfaIC`: email is missing)
- `conlang.ownerUserId` 10/10, `lexicalCategories.ownerUserId` 35/35, `feedback.submittedByUserId` 12/12
- Re-ran: still 477 rows, 477 distinct clerk ids, 0 null emails, 0 unmapped conlangs. Idempotent.

**Fixed while testing:** the dry run computed its plan against a `users` table it had not populated,
so it always reported FAIL. It now stands in for the rows the upsert would create and predicts the
real outcome.

**Verification:**
- [x] 172 tests pass, lint clean, typecheck clean, build succeeds
- [x] Backfill run twice; no duplicates, no nulls
- [x] Production audit still read-only and unchanged: 7 pre-existing orphans, 1 blocker

**Dependencies:** Task 2.2

---

### Task 2.4: `getCurrentUser()` and call-site migration DONE
- [x] `src/server/auth/current-user.ts` resolves the Clerk session to a local `users` row, creating or reclaiming on first sight
- [x] Reads `email` / `email_verified` from session claims, falling back to a Clerk fetch when absent
- [x] `src/lib/auth/is-owner.ts` (+ 7 tests, written failing first)
- [x] `src/server/auth/ownership.ts` builds the query-level owner predicate
- [x] All 25 call sites migrated off `auth()`; only `middleware.ts` and the soon-to-be-deleted `/api/users` still import Clerk directly
- [x] PostHog `distinctId` switched to `user.id`
- [x] Writes populate both the new and legacy ownership columns

**Design change: reads match on either column.** The plan had Phase 3 backfill production and then
deploy. Users keep creating conlangs between those two steps using the old code, which writes only
`ownerId`. Those rows would have a null `ownerUserId` and become invisible to their owners the moment
the new code deployed. Reads now match `ownerUserId` OR the legacy `ownerId`, so deploy ordering
cannot lose anyone. The fallback is removed with the legacy columns.

**Verified with a live simulation:** set a conlang's `ownerUserId` to null (the exact
backfill-to-deploy scenario), confirmed the dual-read still finds it and an `ownerUserId`-only query
does not, then restored it.

**Failing closed:** a conflict from `resolveUser` logs and returns null rather than linking. An
identity with no email logs and returns null rather than surfacing a raw NOT NULL violation.

**Verification:**
- [x] 179 tests pass, lint clean, typecheck clean, build succeeds
- [x] Signed-out browser pass: homepage with owner attribution, `/lang/1` lexicon and grammar, `/lang`, `/search`, `/sign-in` all 200 with no console errors
- [ ] **Signed-in pass still needed** (user action): dashboard, create, edit, delete

**Dependencies:** Task 2.3

---

### Task 2.5: Replace `/api/users` with a DB join DONE
- [x] Deleted `src/app/api/users/route.ts`, `src/app/api/users/types.ts`, `src/hooks/data/useUsers.ts`
- [x] `getOwnersForConlangs()` resolves display data server-side from the local `users` table
- [x] `src/lib/auth/map-owners.ts` (+ 7 tests, written failing first)
- [x] `recent-conlangs-showcase.tsx`, `dashboard/page.tsx`, `search/page.tsx`, `conlang-table.tsx` take owners as a prop
- [x] React Query prefetch and `HydrationBoundary` removed from the dashboard

**What this closes:** the last `clerkClient` call outside middleware, and the unauthenticated
endpoint that resolved arbitrary Clerk ids to real names and avatars. Attribution no longer leaves
the server as an owner id, and only `name` and `imageUrl` reach the client.

**Also gained:** the dashboard bundle dropped from 9.04 kB to 3.14 kB, and owner attribution now
renders server-side instead of after a client round trip.

**Verification:**
- [x] 186 tests pass, lint clean, typecheck clean, build succeeds
- [x] `/api/users` returns 404; no references to it or `useUsers` remain
- [x] Homepage showcase still renders "by Charles Davis" / "by Charlie Davis", now from the DB
- [x] `/search` and `/lang/1` render correctly signed out

**Dependencies:** Task 2.4

---

### Checkpoint 2
- [ ] Audit on `test_`: zero unmapped conlangs
- [ ] Lint, build, tests green
- [ ] Manual pass: sign in → conlang → edit word → create conlang → dashboard attribution
- [ ] **No user-visible change.** This phase is correct only if it is invisible

---

## Phase 3: Apply Phase 2 to production data

*`TABLE_PREFIX=conlang-dictionary_`. Executed with sign-off after the signed-in pass.*

- [x] **Pre-flight drift check**: production differed from `test_` only by columns to be added, so
      `push` had no pre-existing divergence to resolve destructively
- [x] **Recovery backup**: `backups/ownership-production-2026-08-31T01-46-22-437Z.json` (mode 0600)
      holds every legacy `ownerId` / `createdBy` / `userId` for all 611 conlangs, 1449 lexical
      categories, 35 tags, 1 feedback row
- [x] **3.1** `db:push` to production, run by the user (the sandbox blocked it for me). Created
      `conlang-dictionary_user` (9 columns) and added the four nullable FK columns. Verified: all
      611/611, 1449/1449, 35/35, 1/1 legacy values intact
- [x] **3.2** Export refreshed: still 478 users, no signups since the snapshot, so it was reused
- [x] **3.3** Backfill: `--dry-run` first, then applied. **477 users inserted**, 477 distinct clerk
      ids, 0 null emails. `conlang.ownerUserId` **603/611**, `lexicalCategories` 1442/1449,
      `tag` 35/35, `feedback` 1/1
- [x] **3.4** Audit: 7 pre-existing orphans, 1 blocking, exactly as predicted before any write
- [ ] **3.5** Deploy to Vercel, **user action** (`git push` is approval-gated in CLAUDE.md)

**The 8 unmapped conlangs are the known, accepted set**, not a surprise: `Poltese`, `test lang`,
`Mafcadian`, `Basseterre`, `deleted`, `Landes`, `Pfaaqlan` (owners deleted from Clerk, already
unreachable before this migration) and `Izaras` (the no-email Apple account). The audit's `FAIL` is
its conservative gate on unmapped conlangs; every one is a case already decided. Phase 5 covers them.

**Scale check:** 152 public conlangs, and the `/search` owner lookup returns 117 rows in ~389ms
against production. No N+1; one query regardless of result size.

### Checkpoint 3
- [x] 477 users in production `users`, all with non-null emails
- [x] Zero *recoverable* owners unmapped
- [x] Legacy columns fully intact as recovery evidence
- [ ] Live site verified after deploy, **user action**
- [ ] **Soak for one week before Phase 4.** Do not compress this

---

## Phase 4: Production cutover (M3)

*Steps 1–5 change nothing live. Full runbook in [SPEC.md](../SPEC.md).*

- [ ] **4.1** Register OAuth apps: **Google first**, then GitHub, Discord. All free. Skip Apple ($99/yr)
- [ ] **4.2** Configure production instance; clone development settings
- [ ] **4.3** Add `conlangdictionary.com` + DNS CNAMEs (allow 48h; **DNS only**, not proxied, if behind Cloudflare)
- [ ] **4.4** Re-apply session token claims — *easily forgotten; reclaim degrades silently without it*
- [ ] **4.5** **Enable Organizations**, or `middleware.ts`'s `org:admin` guard on `/admin` breaks
- [ ] **4.6** Final Clerk export + backfill from the dev instance
- [ ] **4.7** Swap `pk_test_`/`sk_test_` → `pk_live_`/`sk_live_` in Vercel Production — **this is the cutover**
- [ ] **4.8** Set `authorizedParties: ["https://conlangdictionary.com"]` in `clerkMiddleware()`
- [ ] **4.9** PostHog `$create_alias` old-Clerk-ID → `users.id` on first post-cutover sign-in
- [ ] **4.10** Add the "Not seeing your conlangs?" fallback link (routes to the existing feedback modal)
- [ ] **4.11** **Keep the development instance for 90 days** as recovery source of truth

### Checkpoint 4 — Complete
- [ ] A pre-existing account signs in via Google and sees its conlangs with **no manual step**
- [ ] A brand-new signup works end to end
- [ ] `/admin` still gated
- [ ] Sign-in emails no longer prefixed "development"
- [ ] Audit still clean; dev instance untouched

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

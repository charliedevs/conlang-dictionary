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

### Task 2.1: Pure decision functions (TDD — tests first)
- [ ] `src/lib/auth/resolve-user.test.ts` written **before** the implementation
- [ ] `src/lib/auth/resolve-user.ts` → `existing-by-clerk-id` | `reclaim-by-email` | `create-new` | `conflict`
- [ ] `src/lib/auth/backfill-record.test.ts` written **before** the implementation
- [ ] `src/lib/auth/backfill-record.ts` → Clerk API user → `users` insert

**Acceptance criteria (test cases):**
- [ ] Clerk-ID match beats email match
- [ ] **Unverified email never reclaims** (account-takeover guard)
- [ ] Two rows sharing an email → `conflict`, never a silent pick
- [ ] Email normalised for case and whitespace before comparison
- [ ] Missing primary email; multiple emails; Apple private-relay address; absent username

**Verification:**
- [ ] `npm test` passes; no DB or network in these tests

**Dependencies:** None

---

### Task 2.2: Schema proposal — **ASK FIRST** (CLAUDE.md: out of scope without approval)
- [ ] Present the exact `schema.ts` diff before touching anything
- [ ] New `users` table: `id` uuid PK, `clerkUserId` varchar unique nullable, `email`, `emailVerified`, `username`, `displayName`, `imageUrl`, `createdAt`, `updatedAt`
- [ ] Indexes on `clerkUserId` and `lower(email)`
- [ ] Expand-phase nullable uuid FKs: `conlangs.ownerUserId`, `lexicalCategories.ownerUserId`, `tags.createdByUserId`, `feedback.submittedByUserId`
- [ ] **No column drops. No column retypes.** Old columns stay populated and untouched
- [ ] `db:push` against `test_` only — approval required

**Verification:**
- [ ] Review the generated SQL before pushing; confirm additive-only
- [ ] `npm run db:studio` shows the new table and columns under the `test_` prefix

**Dependencies:** Task 2.1

---

### Task 2.3: Backfill and audit scripts
- [ ] `scripts/backfill-users.ts` — idempotent upsert by `clerkUserId` from the **Phase 0 snapshot** (not a live API call, so it's reproducible)
- [ ] Populate new FK columns by joining old values against `users.clerkUserId`
- [ ] `scripts/audit-users.ts` — report unmapped owners, unverified emails, duplicate emails
- [ ] Both print the resolved `TABLE_PREFIX` and row counts before acting
- [ ] Both require typed confirmation when the prefix is **not** `test_`
- [ ] Both support `--dry-run`

**Acceptance criteria:**
- [ ] Re-running the backfill twice produces no duplicates
- [ ] **Hard gate:** zero unmapped rows in `conlangs`. Orphans in `tags`/`feedback` may stay null

**Verification:**
- [ ] `--dry-run` first, every time
- [ ] `npm run users:audit` reports zero unmapped conlangs on `test_`

**Dependencies:** Task 2.2

---

### Task 2.4: `getCurrentUser()` and call-site migration
- [ ] `src/server/auth/current-user.ts` — resolve `await auth()` → `users` row via `resolve-user.ts`, create on first sight, refresh `displayName`/`imageUrl`
- [ ] Configure Clerk session token claims (dashboard): `{"email": "{{user.primary_email_address}}", "email_verified": "{{user.email_verified}}"}`
- [ ] Fall back to `(await clerkClient()).users.getUser()` when claims absent — needed during cutover for in-flight old-instance tokens
- [ ] Convert ~25 `const { userId } = auth()` sites to `getCurrentUser()`, using `user.id` against the new columns
- [ ] Switch PostHog `distinctId` to `user.id` in `queries.ts` and `_analytics/provider.tsx`

**Acceptance criteria:**
- [ ] All ownership reads/writes go through `users.id`
- [ ] Unauthenticated paths (public conlangs, feedback form) still work with no user

**Verification:**
- [ ] `npm run lint && npm run build && npm test`
- [ ] Manual: create a conlang → new row has both `ownerId` and `ownerUserId` populated

**Dependencies:** Task 2.3

---

### Task 2.5: Replace `/api/users` with a DB join
- [ ] Delete `src/app/api/users/route.ts`, `src/app/api/users/types.ts`, `src/hooks/data/useUsers.ts`
- [ ] Resolve owner display data server-side; pass as props
- [ ] Update `src/app/_components/recent-conlangs-showcase.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/_components/conlang-table.tsx`

**Acceptance criteria:**
- [ ] Owner names and avatars still render everywhere they did before
- [ ] `grep -rn "clerkClient" src/` returns only the `getCurrentUser()` fallback
- [ ] The unauthenticated endpoint that resolved arbitrary Clerk IDs to names/avatars is gone

**Verification:**
- [ ] `npm run lint && npm run build`
- [ ] Manual: dashboard and homepage showcase show correct owner attribution

**Dependencies:** Task 2.4

---

### Checkpoint 2
- [ ] Audit on `test_`: zero unmapped conlangs
- [ ] Lint, build, tests green
- [ ] Manual pass: sign in → conlang → edit word → create conlang → dashboard attribution
- [ ] **No user-visible change.** This phase is correct only if it is invisible

---

## Phase 3: Apply Phase 2 to production data

*`TABLE_PREFIX=conlang-dictionary_`. Per-command approval. Rehearsal must be complete and clean.*

- [ ] **3.1** `db:push` against production — additive only, no drops (**approval required**)
- [ ] **3.2** Re-run Clerk export to catch signups since Phase 0
- [ ] **3.3** `backfill-users.ts` against production (`--dry-run` first)
- [ ] **3.4** `audit-users.ts` — **must** be zero unmapped conlangs before deploying app code
- [ ] **3.5** Deploy Phase 1 + 2 changes to Vercel

### Checkpoint 3
- [ ] All 478 users in production `users` with non-null emails
- [ ] Zero unmapped conlangs
- [ ] Live site verified: sign in, open conlang, dashboard attribution correct
- [ ] **Soak one week before Phase 4.** Do not compress this

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

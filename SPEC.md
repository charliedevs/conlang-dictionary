# Spec: Clerk Hardening — Identity Decoupling & Production Cutover

## Objective

Conlang Dictionary runs its live authentication on a Clerk **development** instance holding **478 real users**. Clerk documents development instances as capped at 100 users, with user data that "cannot be transferred between instances," and warns that exceeding the cap "can stop your app from being able to sign up or log in users." The app is 4.8× over an unenforced ceiling, on infrastructure Clerk explicitly designates as non-production, with no export path for the identities it holds.

Compounding this: `conlangs.ownerId` stores the raw Clerk user ID (`user_xxx`). A production Clerk instance issues **entirely new user IDs**. Cutting over naively would orphan every conlang from its owner.

This spec makes user access to their conlangs survive any Clerk-side event — enforcement of the cap, an instance cutover, or a future decision to leave Clerk entirely — and does it at **$0/month**.

**Users:** The 478 existing account holders (whose conlangs must remain reachable, without them doing anything unusual), and every future signup.

**Success looks like:**
1. Every one of the 478 identities is mirrored in our own Postgres, keyed by an ID we control, with the email needed to re-find them.
2. Conlang ownership no longer references a Clerk ID anywhere.
3. The app runs on a free Clerk **production** instance, and an existing user signing in with the same Google/Discord/GitHub account or email simply finds their conlangs there.
4. Zero deprecation warnings, with a written cadence for staying current.

**Explicit non-goal:** building our own password authentication. Clerk's free tier covers 50,000 monthly retained users as of February 2026; a hand-rolled replacement would cost far more than it saves and the transition period is exactly when accounts get lost. This spec instead removes the *lock-in* — after M2, swapping providers is a contained change that never touches conlang data.

## Assumptions (confirmed with user)

- **Direction:** stay on Clerk, decouple identity into our DB, then cut over to a free production instance.
- **Current scale:** 478 users on the development instance.
- **Production sign-in methods:** Google, Discord, GitHub, and email code (passwordless). All have free credentials.
- **Apple SSO is dropped.** It requires the Apple Developer Program ($99/yr). If any existing users signed up via Apple, they are handled by the email-match reclaim path (see M3), since Apple relays a stable email address.
- **Scope:** M1–M3 specified in full; M4–M5 sketched.
- **Domain:** `conlangdictionary.com` is owned and DNS is editable — this is the only hard prerequisite for a free production instance.
- **Hosting:** Vercel.

## Findings That Drive The Design

| Finding | Source | Consequence |
|---|---|---|
| Dev instances capped at 100 users; data cannot be transferred between instances | Clerk docs, managing-environments | Backing up identities to our own DB is the only export path. Task 1. |
| Exceeding limits can block sign-up **and log-in** | Clerk docs, dev-mode changelog | Treated as a live production risk, not a future one. |
| Production requires your own OAuth credentials; dev uses Clerk's shared ones | Clerk docs | Google/Discord/GitHub apps must be registered before cutover. |
| Production requires a domain you own + CNAME records; free tier is production-ready | Clerk docs / pricing | $0 cost. DNS propagation up to 48h — schedule accordingly. |
| Free tier raised to 50,000 MRU on 2026-02-05 | Clerk pricing changelog | Removes the cost argument for leaving Clerk. |
| Account linking merges an OAuth sign-in with an existing account when **both** emails are verified | Clerk docs, account-linking | Underpins the reclaim flow — but we match in *our* DB, not Clerk's, so this is a convenience, not a dependency. |
| `@clerk/nextjs@7.x` requires `next ^15.2.8 \|\| ^16` | npm peer deps | v7 is out of reach without a Next major upgrade. |
| `@clerk/nextjs@6.39.6` supports `next ^14.2.25`; project is on 14.2.28 | npm peer deps | v6 lands today with zero Next changes. This is the upgrade target. |
| Clerk's docs suggest storing prior IDs as `external_id` | Clerk docs, migrating | Rejected — it keeps identity inside Clerk. Our own `users` table is strictly better. |

## Tech Stack

No new frameworks. Existing: Next.js 14.2.28 App Router, TypeScript 5.4, Drizzle ORM + Postgres, Vitest, Tailwind + shadcn/ui.

- **Upgrade:** `@clerk/nextjs` `5.7.5` → `6.39.6` (pinned; do **not** jump to 7.x).
- **New dev dependency:** none required. `npx @clerk/upgrade` is run one-off, not installed.
- **Optional (M4 only):** `@clerk/themes` for `baseTheme` dark-mode support. *Ask first.*

## Commands

```bash
npm install                  # after the @clerk/nextjs version bump
npm run dev                  # dev server on :3000
npm run lint                 # ESLint — must pass
npm run build                # production build — must pass
npm test                     # Vitest, single run
npm run test:watch           # Vitest, watch mode
npm run db:push              # applies schema changes — APPROVAL REQUIRED
npm run db:studio            # verify migrated rows by eye

npx @clerk/upgrade           # one-off codemod for the v5 → v6 migration (M1)
npm run users:backfill       # NEW — pages the Clerk Backend API, mirrors all 478 users into Postgres (M2)
npm run users:backfill -- --dry-run   # print what would be written, touch nothing
npm run users:audit          # NEW — reports unmapped ownerIds, unverified emails, duplicate emails
```

### Environment variables

Clerk vars currently bypass `src/env.js`, against the project's own convention. All of the following move into `src/env.js` (server + client blocks) with zod validation:

```bash
# server
CLERK_SECRET_KEY=sk_test_...            # becomes sk_live_... at cutover
# client
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # becomes pk_live_... at cutover
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

**Removed as deprecated:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (still present in `.env` and `.env.example`). Clerk deprecated all `AFTER_SIGN_X_URL` vars in favour of `FALLBACK_REDIRECT_URL` (only redirects when no `redirect_url` is in the querystring — mirrors the old behaviour) and `FORCE_REDIRECT_URL` (always redirects, interrupting the user's flow). **Fallback is the correct choice here** — force-redirect would yank a user away from the conlang page they were viewing when they signed in. Note `.env.local` currently uses the `FORCE_` variants; that is a live inconsistency to fix.

---

# M1 — SDK Upgrade & Deprecation Hygiene

**Depends on:** nothing. **Do this first** — it rewrites the same `auth()` call sites M2 will touch, and doing it second means editing them twice.

## Changes

`@clerk/nextjs` 5.7.5 → 6.39.6. Run `npx @clerk/upgrade` first, then hand-verify every site — the codemod is good but not exhaustive.

| Deprecated (v5) | Correct (v6) | Files |
|---|---|---|
| `auth()` (sync) | `await auth()` | `src/server/queries.ts`, `src/server/mutations.ts`, `src/server/actions/feedback.ts`, `src/server/actions/lexical-category.ts`, `src/app/lang/[id]/page.tsx`, `src/app/lang/_components/lexicon/lexicon.tsx`, `src/app/lang/_components/grammar/grammar.tsx` |
| `clerkClient.users.getUserList()` | `(await clerkClient()).users.getUserList()` | `src/app/api/users/route.ts:29` |
| `auth().protect()` | `await auth.protect()` | `src/middleware.ts` |
| `auth().protect({ role })` | `await auth.protect({ role })` | `src/middleware.ts` |
| `AFTER_SIGN_IN_URL` env vars | `SIGN_IN_FALLBACK_REDIRECT_URL` | `.env`, `.env.example` |

`clerkMiddleware()` is already in use — no `authMiddleware()` migration needed. Every callback in `middleware.ts` and every route handler reached through a changed call site must become `async`.

## Staying current (the user's actual question)

The deprecation warning was a symptom of having no upgrade cadence. Establish one:

1. **Pin, don't float.** Change `"@clerk/nextjs": "^5.0.3"` to an exact `"6.39.6"`. A caret range on an auth dependency means an unreviewed `npm install` can silently shift your auth layer.
2. **Add to CLAUDE.md** a short "Dependency cadence" section: run `npm outdated` monthly; read `clerk/javascript`'s `packages/nextjs/CHANGELOG.md` before any Clerk bump; treat console deprecation warnings as bugs with a ticket, not noise.
3. **Record the v7 blocker.** v7 requires Next 15.2+. Write this down in CLAUDE.md so the next person doesn't burn an afternoon discovering it. The Next 14 → 15 upgrade is its own project and is explicitly out of scope here.
4. **Surface warnings.** Clerk deprecation warnings appear in the server console and are easy to miss on Vercel. Add a `console.warn` breadcrumb capture to the existing Sentry config so they show up where they'll be seen.

## Acceptance criteria

- `npm run build` and `npm run lint` pass.
- Browser and server consoles show **zero** Clerk deprecation warnings.
- Signed-out user can sign in; signed-in user reaches `/dashboard`; `/admin` still rejects non-admins; `/api/users` still returns the filtered list.
- `package.json` pins an exact Clerk version.
- No behaviour change is visible to users. This module is invisible if done right.

---

# M2 — Identity Decoupling

**Depends on:** M1. **This is the module that satisfies the "preserving user access is imperative" requirement.**

The insight: the user's instinct to "add user sign-in info to db tables" was correct — but the part that matters is storing *identity*, not *credentials*. Credentials stay Clerk's problem. Identity becomes ours.

## Task 1 (do before anything else): back up the 478

Before any schema redesign, get the identities out of the development instance. This is the only thing standing between an enforcement event and 478 orphaned accounts.

`npm run users:backfill` pages `GET /v1/users?limit=100&offset=N` via the Clerk Backend API and writes, for each user: Clerk ID, primary email address, **email verification status**, username, full name, image URL, and the external accounts (OAuth providers) attached. It writes to the new `users` table **and** dumps a timestamped JSON snapshot to a gitignored `./backups/` directory as a belt-and-braces offline copy.

The script must be **idempotent** (re-runnable, upserts by `clerkUserId`) and support `--dry-run`.

## Schema — ask-first, expand/migrate/contract

`src/server/db/schema.ts` is marked out of scope in CLAUDE.md, and `db:push` has no rollback path. Every change below is proposed for approval, applied **expand → migrate → contract** so no populated column is ever destructively retyped in a single step.

**New table:**

```
users
  id            uuid PK        -- OUR id. Never leaves our DB. Never changes.
  clerkUserId   varchar(256)   unique, nullable  -- the ONLY Clerk-coupled column
  email         varchar(320)   not null
  emailVerified boolean        not null default false
  username      varchar(256)   nullable
  displayName   varchar(256)   nullable
  imageUrl      text           nullable
  createdAt     timestamp      not null
  updatedAt     timestamp      nullable
  index on (clerkUserId), index on (lower(email))
```

`clerkUserId` is nullable and is the single point of contact with Clerk. At cutover it is rewritten; nothing else moves. If Clerk were ever replaced, this column is what gets swapped.

**Expand — add nullable uuid columns alongside the existing ones:**

| Table | Existing (Clerk ID) | New |
|---|---|---|
| `conlangs` | `ownerId` varchar | `ownerUserId` uuid → `users.id` |
| `lexicalCategories` | `ownerId` varchar | `ownerUserId` uuid → `users.id` |
| `tags` | `createdBy` varchar | `createdByUserId` uuid → `users.id` |
| `feedback` | `userId` varchar | `submittedByUserId` uuid → `users.id` |

**Migrate:** backfill each new column by joining the old value against `users.clerkUserId`. Run `npm run users:audit` and require **zero** unmapped rows in `conlangs` before proceeding. (Orphans in `tags`/`feedback` are tolerable and get left null; an orphan in `conlangs` is a lost conlang and blocks the module.)

**Contract:** switch all reads/writes to the new columns, ship, let it run in production for at least a week, *then* propose dropping the old columns as a separate approval. Do not drop them in the same pass — they are the recovery data if the mapping is wrong.

## Application layer

- `src/server/auth/current-user.ts` — `getCurrentUser()`: resolves `await auth()` → `users` row, creating it on first sight. Every existing `const { userId } = await auth()` in `queries.ts` / `mutations.ts` / actions becomes `const user = await getCurrentUser()` and uses `user.id`.
- `src/lib/auth/resolve-user.ts` — **pure**, TDD'd: given a Clerk identity `{ clerkUserId, email, emailVerified }` and the candidate `users` rows matching that email, return a discriminated decision: `{ kind: "existing-by-clerk-id" } | { kind: "reclaim-by-email" } | { kind: "create-new" } | { kind: "conflict", reason }`. All the risk in M3 lives in this function, which is why it is pure and tested to death.
- `src/lib/auth/backfill-record.ts` — **pure**, TDD'd: maps a Clerk API user object to a `users` insert. Handles missing primary email, multiple emails, absent username.

To avoid a Clerk API round-trip on every request, add `email` and `email_verified` to the Clerk **session token claims** (dashboard → Sessions → Customize session token):

```json
{ "email": "{{user.primary_email_address}}", "email_verified": "{{user.email_verified}}" }
```

Read them from `sessionClaims`, falling back to `(await clerkClient()).users.getUser()` when absent. The fallback matters during cutover, when tokens minted by the old instance are still in flight.

## Testing

Per CLAUDE.md, pure logic gets a failing test first, colocated:

- `src/lib/auth/resolve-user.test.ts` — existing clerk id wins over email match; verified-email reclaim links; **unverified email never reclaims** (account-takeover guard); two `users` rows sharing an email returns `conflict`, never a silent pick; email case/whitespace normalised before comparison.
- `src/lib/auth/backfill-record.test.ts` — user with no primary email, user with several, Apple private-relay addresses, missing username.

`getCurrentUser()` (DB-backed) and the backfill script have no harness — they require `npm run lint`, `npm run build`, `--dry-run` against the real instance, and manual browser verification, exactly as CLAUDE.md prescribes.

## Acceptance criteria

- All 478 users present in `users` with a non-null email; JSON snapshot exists in `./backups/`.
- `npm run users:audit` reports **zero** `conlangs` rows with an unmapped owner.
- Every ownership read/write goes through `users.id`. `grep -rn "ownerId" src/server` returns only the contract-phase leftovers.
- No user-visible change. Sign in, open a conlang, edit a word, create a conlang — all identical to before.
- Old columns still populated and untouched.

---

# M3 — Production Cutover

**Depends on:** M2 complete and running in production for at least a week. **Do not start M3 until `users` is proven.**

Because M2 gave us email-keyed identity we control, this needs **no Clerk bulk import**. Users sign in to the new instance with the same account and the app re-finds them.

## Dashboard runbook (the walkthrough you asked for)

Do steps 1–5 with no code deployed. Nothing here affects the live site until step 8.

1. **Register OAuth apps** (all free, ~15 min each). For each, the redirect URI is `https://clerk.conlangdictionary.com/v1/oauth_callback`, which Clerk shows you per-provider.
   - **Google** — Google Cloud Console → new project → OAuth consent screen (External) → Credentials → OAuth client ID (Web). Free. **Do this one first**; it is almost certainly how most of the 478 signed up.
   - **GitHub** — Settings → Developer settings → OAuth Apps → New. Free.
   - **Discord** — Discord Developer Portal → New Application → OAuth2. Free.
   - **Apple** — skipped. Requires the $99/yr Apple Developer Program.
2. **Create the production instance.** Clerk Dashboard → environment dropdown → *Create production instance* → **clone development settings**. Cloning carries over your session/appearance config; it does **not** carry users.
3. **Add the domain** `conlangdictionary.com` on the Domains page.
4. **Add DNS records** at your registrar — Clerk shows the exact set (CNAMEs for the Frontend API, Account Portal, and email/DKIM). Two cautions: allow up to **48h** for propagation, and if any of these sit behind Cloudflare, set them to **DNS only** (grey cloud) — Clerk's validation fails against a proxied record.
5. **Configure sign-in methods** on the production instance: enable Google, Discord, GitHub, and email code; paste in the credentials from step 1. Disable Apple. Re-apply the session-token claims from M2 — **this is the step most likely to be forgotten, and the reclaim flow silently degrades without it.**
6. **Wait for DNS to verify.** All records green in the dashboard before proceeding.
7. **Final backfill.** Re-run `npm run users:backfill` against the *development* instance to catch anyone who signed up during the window. Snapshot again.
8. **Swap keys in Vercel** — `pk_test_` → `pk_live_`, `sk_test_` → `sk_live_`, for Production only. Redeploy. **This is the cutover moment.**
9. **Set `authorizedParties`** in `clerkMiddleware()` to `["https://conlangdictionary.com"]` to prevent subdomain cookie leaking — Clerk flags this as a common production omission.
10. **Verify** with a real account before announcing (see criteria below).
11. **Do not delete the development instance.** Keep it for at least 90 days as the recovery source of truth.

## Reclaim flow

On first sign-in after cutover, `getCurrentUser()` finds no `users` row for the new `clerkUserId`, falls through to `resolve-user.ts`, and:

- **Verified email matches exactly one `users` row** → rewrite that row's `clerkUserId` to the new ID. The user's conlangs are simply there. No prompt, no interstitial, no email campaign.
- **No match** → create a new `users` row. Genuine new signup.
- **Unverified email, or multiple matching rows** → create a *new* row (never link), log to Sentry with the conflict reason, and surface a quiet "Not seeing your conlangs?" link routing to the existing feedback modal for manual resolution.

Every reclaim writes an audit log line: old clerk ID, new clerk ID, email, timestamp.

**Manual fallback:** because `users` holds email + old Clerk ID + the mapped ownership rows, any user who can't be matched automatically can be reconnected with a single UPDATE. No conlang is ever unrecoverable.

**Users who signed up via Apple** (if any) still land on their verified relay email and reclaim normally, provided that email is what's stored in `users`.

## Acceptance criteria

- All DNS records verified; `pk_live_`/`sk_live_` live in Vercel Production.
- A pre-existing account signs in via Google on the production instance and sees its conlangs **without any manual step**.
- The audit log shows a reclaim event for that account, with `clerkUserId` rewritten in place.
- A brand-new signup creates a fresh `users` row and can create a conlang.
- Sign-in emails no longer carry the "development" prefix.
- Development instance still exists, untouched.
- `npm run users:audit` reports zero unmapped `conlangs` rows post-cutover.

---

# M4 — Auth UI Integration *(sketch — deferred)*

**Depends on:** M1. Deliberately deferred; noted here so M1–M3 don't design it into a corner.

The `<SignIn>`/`<SignUp>` pages currently render Clerk's stock components bare (`src/app/sign-in/[[...sign-in]]/page.tsx`), and `<UserButton>` in `src/app/_components/topnav.tsx` is unstyled. Against DESIGN.md's near-monochrome ink/paper system, stock Clerk reads as a foreign object.

Direction when picked up: drive Clerk's `appearance` prop from the same CSS custom properties `globals.css` already defines, so the components inherit the theme rather than duplicating it — `colorPrimary` → Ink, `borderRadius` → the 6px `rounded-md` step, `fontFamily` → Inter. **Signal Orange must not appear anywhere in the auth UI**; per DESIGN.md's One Mark Rule it is a brand mark, not an interactive colour, and Clerk's default is to use the primary colour for buttons. Dark mode needs `appearance` recomputed from `next-themes`' resolved theme inside a client component (`ClerkProvider` is currently in the server `layout.tsx`, so this requires a small restructure). Replacing `<UserButton>` with a shadcn `DropdownMenu` over `useUser()` is the higher-fidelity option and worth costing against the appearance-prop route.

Constraint inherited from M1: pin whatever `@clerk/themes` version matches `@clerk/nextjs@6.39.6`.

# M5 — Account Management Page *(sketch — deferred)*

**Depends on:** M2, M4. An `/account` route with a themed `<UserProfile>`, plus the genuinely app-specific parts M2 makes possible: "export all my conlangs" (reusing the existing `src/lib/conlang-export/` serializers) and a danger zone. Account deletion must delete or reassign owned conlangs deliberately — with `users.id` as the ownership key this is finally a well-defined operation, which it is not today.

---

## Project Structure

```
src/env.js                                  → Clerk vars move here (M1)
src/middleware.ts                           → await auth.protect(), authorizedParties (M1, M3)
src/app/api/users/route.ts                  → (await clerkClient()) (M1)
src/server/queries.ts                       → await auth() → getCurrentUser() (M1, M2)
src/server/mutations.ts                     → await auth() → getCurrentUser() (M1, M2)
src/server/actions/feedback.ts              → await auth() (M1, M2)
src/server/actions/lexical-category.ts      → await auth() (M1, M2)
src/app/lang/[id]/page.tsx                  → await auth() (M1)
src/app/lang/_components/lexicon/lexicon.tsx  → await auth() (M1)
src/app/lang/_components/grammar/grammar.tsx  → await auth() (M1)

src/server/db/schema.ts                     → users table + uuid FK columns (M2) — ASK FIRST
src/server/auth/current-user.ts             → NEW: getCurrentUser() (M2)
src/lib/auth/resolve-user.ts                → NEW: pure link/create/conflict decision (M2)
src/lib/auth/resolve-user.test.ts           → NEW: TDD, written first (M2)
src/lib/auth/backfill-record.ts             → NEW: pure Clerk-user → users-row mapper (M2)
src/lib/auth/backfill-record.test.ts        → NEW: TDD, written first (M2)
scripts/backfill-users.ts                   → NEW: paged Clerk export + snapshot (M2)
scripts/audit-users.ts                      → NEW: unmapped-owner report (M2)
backups/                                    → NEW, gitignored: JSON identity snapshots (M2)

CLAUDE.md                                   → dependency cadence + v7/Next-15 blocker (M1)
.env / .env.example                         → deprecated redirect vars removed (M1)
```

## Code Style

Follow existing conventions — this spec introduces no new patterns.

- Import app code via `~/*`, never relative paths across top-level dirs.
- Env access through `src/env.js` only. **Never `process.env` directly** — the Clerk vars violating this today are fixed in M1.
- `"server-only"` at the top of anything under `src/server/`, matching `queries.ts` / `mutations.ts`.
- Pure logic lives in `src/lib/`, is exported as named functions, takes plain data, and returns discriminated unions rather than throwing.
- Scripts in `scripts/` are standalone, idempotent, and support `--dry-run`.
- Zod for every external boundary, including the Clerk API responses the backfill parses — do not trust their shape across an SDK major.

## Testing Strategy

Per CLAUDE.md: Vitest covers pure logic, tests colocated, written **before** implementation.

**TDD (failing test first):** `resolve-user.ts`, `backfill-record.ts`. These carry all of the data-loss risk and none of the infrastructure, which is exactly why they were carved out as pure functions.

**No harness — verify with lint + build + manual browser check:** `getCurrentUser()`, the middleware changes, the backfill and audit scripts, all Clerk components. Additionally for M2/M3: `--dry-run` against the real instance before any write, and `npm run db:studio` to eyeball migrated rows.

**Cutover verification is manual and non-negotiable** — at minimum one pre-existing account and one brand-new signup, end to end, before announcing.

## Boundaries

### Always
- Snapshot user identities to `./backups/` before any write that touches them.
- Run `--dry-run` before any script that writes.
- Keep the development instance alive and untouched for 90 days past cutover.
- Treat an unmapped `conlangs.ownerId` as a blocking error, never a warning.
- Match users on **verified** emails only.

### Ask first
- **Any edit to `src/server/db/schema.ts`** (CLAUDE.md: out of scope without confirmation).
- **Running `npm run db:push`** against the real database (CLAUDE.md: approval required).
- **`git push` or opening a PR** (CLAUDE.md: approval required).
- Adding any dependency, including `@clerk/themes`.
- Dropping the old `ownerId` / `createdBy` / `userId` columns — a separate approval, a week after M2 ships.

### Never
- Never link an account on an **unverified** email. This is the account-takeover vector; on any ambiguity, create a new row and log a conflict.
- Never delete a Clerk user, in either instance.
- Never delete a conlang because its owner can't be resolved. Orphaned data waits for manual repair.
- Never send the "your account will be deleted unless you click this link" email campaign from the original plan. With M2 in place it is unnecessary, and it would destroy exactly the data this spec exists to protect.
- Never upgrade to `@clerk/nextjs` 7.x while the project is on Next 14 — the peer dependency forbids it.
- Never swap production keys before the final backfill (M3 step 7) has run.
- Never commit `./backups/` — it contains 478 users' email addresses.

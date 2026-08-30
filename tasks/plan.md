# Implementation Plan: Anonymous Feedback Form

## Overview

Add a footer-triggered feedback modal, open to anonymous and signed-in visitors alike, that submits a Bug/Idea/Other report to a new `feedback` table and fires a best-effort email notification via Resend to a private, server-only address. Per `SPEC.md`'s decisions: DB is the source of truth, email is notification-only, spam is filtered via the existing (currently unused) Upstash rate limiter plus a honeypot field.

*(Note: `tasks/plan.md` and `tasks/todo.md` previously held a fully-completed, already-merged feature — Conlang Export & Import (PR #18, verified in `git log`). That plan is superseded and replaced below.)*

## Architecture Decisions

- **Schema change is ask-first.** `src/server/db/schema.ts` is out of scope per `CLAUDE.md` — the new `feedback` table is proposed in Task 1 but not applied via `db:push` without explicit approval.
- **Resend is a new dependency** (ask-first per `SPEC.md` boundaries) — added in the task that first needs it (Task 3, email sending), not speculatively earlier.
- **Vertical slicing:** ship DB-only capture first (Task 1: schema + mutation + pure validation, Task 2: server action + UI, fully working without email), then layer email notification on top (Task 3), then spam hardening (Task 4). This means the feature is demoable and revertible at each step — a working "anonymous feedback lands in the DB" slice exists before email or rate-limiting are added.
- **Pure logic gets TDD'd; DB/email/DOM glue gets manual verification** — matches `CLAUDE.md`'s existing testing convention (same split used in the conlang-export plan).
- **Rate limiter reuses `ratelimit.ts`'s existing config** (10 req/100s), keyed as `feedback_{ip}` — no new Upstash setup needed, this is that limiter's first real caller.

## Task List

### Phase 1: Foundation (schema + pure validation)
- [ ] Task 1: Propose `feedback` table schema + zod validation schema + DB mutation

### Checkpoint A
- [ ] Schema change approved and applied via `db:push` (explicit user approval required)
- [ ] Unit tests for zod schema pass

### Phase 2: Core capture flow (DB-only, no email yet)
- [ ] Task 2: Server action + feedback modal UI, wired to footer — submissions land in DB

### Checkpoint B
- [ ] End-to-end manual check: anonymous submit → row in DB → success toast
- [ ] Lint + build clean
- [ ] Review with user before adding email (external dependency)

### Phase 3: Email notification
- [ ] Task 3: Resend integration — best-effort email on successful submission

### Checkpoint C
- [ ] Manual check: real email arrives at `FEEDBACK_NOTIFY_EMAIL`, address not present in any client-visible output
- [ ] Email failure path verified not to fail the user-facing submission

### Phase 4: Spam hardening
- [ ] Task 4: Rate limiting + honeypot field

### Checkpoint: Complete
- [ ] All `SPEC.md` success criteria met
- [ ] Lint, build, full test suite pass
- [ ] Ready for final review

## Task Details

### Task 1: `feedback` schema, zod validation, and mutation

**Description:** Add the `feedback` table to `schema.ts` (ask-first — present the exact diff and get approval before running `db:push`), the shared zod validation schema used by both client and server, and the `insertFeedback` mutation.

**Acceptance criteria:**
- [ ] `feedback` table has: `id` (serial PK), `type` (pgEnum: `bug` | `idea` | `other`), `message` (text, not null), `contactEmail` (varchar, nullable), `userId` (varchar, nullable — set only when Clerk `auth()` resolves one), `createdAt` (timestamp, default now)
- [ ] `src/lib/feedback/schema.ts` exports a zod schema (`type` enum, `message` min 1 / max ~2000 chars, `contactEmail` optional + valid email format) and the inferred `FeedbackInput` type
- [ ] `insertFeedback()` added to `src/server/mutations.ts`, following the existing insert pattern (e.g. `insertLexicalCategory`)

**Verification:**
- [ ] `npm test` passes — new `src/lib/feedback/schema.test.ts` (valid input, missing message, invalid email, each type value)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (schema compiles; `db:push` is a separate, explicitly-approved manual step — not run by this task automatically)
- [ ] Manual: after approved `db:push`, confirm the table exists via `npm run db:studio`

**Dependencies:** None

**Files:**
- `src/server/db/schema.ts` (ask-first edit)
- `src/lib/feedback/schema.ts` + `.test.ts` (new)
- `src/server/mutations.ts`

**Estimated scope:** Small (3 files)

---

### Task 2: Server action + feedback modal UI

**Description:** Build the `submitFeedback` server action (validate → insert, no email/rate-limit yet — those land in Tasks 3–4) and the client-facing modal form, wired into the footer as "Send feedback" next to "Report an issue."

**Acceptance criteria:**
- [ ] `src/server/actions/feedback.ts` exports `submitFeedback(input)`: parses with the Task 1 zod schema, attaches `userId` from Clerk `auth()` if present, calls `insertFeedback`
- [ ] `src/app/_components/feedback-dialog.tsx`: `DialogDrawer`-based modal with type select (Bug/Idea/Other), message textarea, optional email input, using `react-hook-form` + `zodResolver` + `sonner` toast on success/error — matches `new-conlang-form.tsx`'s pattern
- [ ] `src/app/_components/footer.tsx` gets a "Send feedback" trigger opening the modal, placed next to the existing "Report an issue" link; GitHub link is unchanged
- [ ] Submitting with an empty message shows inline validation error, no server call
- [ ] Submitting a valid form (signed out) closes the dialog and shows a success toast

**Verification:**
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual (browser): open footer modal signed-out, submit valid feedback, confirm success toast + new row via `db:studio`; submit empty message, confirm inline error and no new row; open modal signed-in, confirm `userId` is attached to the resulting row

**Dependencies:** Task 1

**Files:**
- `src/server/actions/feedback.ts` (new)
- `src/app/_components/feedback-dialog.tsx` (new)
- `src/app/_components/footer.tsx`

**Estimated scope:** Medium (3 files)

---

### Task 3: Resend email notification

**Description:** Add the Resend client and a pure email-body serializer, then call it from `submitFeedback` as a best-effort side effect that never fails the user's submission.

**Acceptance criteria:**
- [ ] `resend` added to `package.json` (ask-first — confirm before `npm install`)
- [ ] `RESEND_API_KEY` and `FEEDBACK_NOTIFY_EMAIL` added to `src/env.js` (server-only) and `.env.example` (placeholder values only)
- [ ] `src/lib/feedback/build-notification-email.ts`: pure function `FeedbackInput → { subject, text }`, formatting type/message/contact email/timestamp
- [ ] `src/server/email.ts`: Resend client init (mirrors `ratelimit.ts`'s module-level singleton pattern) + `sendFeedbackNotification(input)` wrapping the serializer + `resend.emails.send`
- [ ] `submitFeedback` calls `sendFeedbackNotification` after a successful insert, wrapped in try/catch that logs but does not throw — the DB row is unaffected by email failure
- [ ] `FEEDBACK_NOTIFY_EMAIL` never appears in any client bundle, API response, or rendered HTML

**Verification:**
- [ ] `npm test` passes — new `src/lib/feedback/build-notification-email.test.ts` (subject/body for each feedback type, with and without contact email)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual: one real end-to-end submission confirms an email arrives at `FEEDBACK_NOTIFY_EMAIL` with correct content; `view-source`/network tab confirms the address isn't exposed client-side
- [ ] Manual: temporarily break `RESEND_API_KEY` (bad value) and confirm submission still succeeds (DB row created, success toast shown, error logged server-side) — then restore the real key

**Dependencies:** Task 2

**Files:**
- `src/lib/feedback/build-notification-email.ts` + `.test.ts` (new)
- `src/server/email.ts` (new)
- `src/server/actions/feedback.ts`
- `src/env.js`, `.env.example`

**Estimated scope:** Medium (5 files)

---

### Task 4: Rate limiting + honeypot

**Description:** Harden the now-working, now-emailing form against spam: reuse `ratelimit.ts` keyed by IP, and add a hidden honeypot field that short-circuits processing when filled.

**Acceptance criteria:**
- [ ] `submitFeedback` checks `ratelimit.limit(\`feedback_${ip}\`)` (IP from `headers().get("x-forwarded-for")`) before validating/inserting; over-limit throws a friendly error the UI surfaces via toast
- [ ] `submitFeedback` accepts a `honeypot` field; if non-empty, returns a normal-looking success response immediately without inserting a DB row or sending email
- [ ] `feedback-dialog.tsx` renders the honeypot input visually hidden (not `display:none`/`type=hidden` alone — use an off-screen technique real users won't trigger but simple bots will) and wires it into the submitted payload

**Verification:**
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual: fill the honeypot via devtools and submit — confirm apparent success but no new DB row and no email sent
- [ ] Manual: submit 11+ times rapidly from the same session — confirm the 11th+ attempt shows a friendly rate-limit error, not a crash

**Dependencies:** Task 3

**Files:**
- `src/server/actions/feedback.ts`
- `src/app/_components/feedback-dialog.tsx`

**Estimated scope:** Small (2 files)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema/db:push edit happens without approval, touching the live DB | High | Task 1 explicitly stops for approval before `db:push`; build/lint verify compilation without it |
| Email send blocks or fails the user's submission | Medium | Task 3 wraps the send in try/catch after the DB insert already succeeded |
| Notify email address leaks client-side (bundle, response body, source) | Medium | Task 3 explicitly checks this in verification; address only ever read server-side via `env.js` |
| Honeypot/rate-limit logic accidentally blocks real users | Medium | Manual verification in Task 4 covers both the legitimate path and the bot path |
| Adding `resend` pulls in an unwanted dependency footprint | Low | Ask-first gate before `npm install`; deferred to Task 3 rather than installed speculatively in Task 1 |

## Open Questions

Carried over from `SPEC.md` — resolve before or during Task 3:
1. Resend sender: shared `onboarding@resend.dev` vs. a verified domain (`conlangdictionary.com` is live per user, could be verified with Resend for a branded "from" address later — not required for this feature to work).
2. Whether an admin view to browse feedback is a fast-follow (explicitly out of scope for this plan).
3. Whether the shared 10 req/100s rate-limit window is fine for feedback specifically, or should be tighter.

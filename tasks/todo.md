# Todo: Anonymous Feedback Form

See [tasks/plan.md](plan.md) for full context and architecture decisions.

*(Supersedes the previous contents of this file, which tracked the now fully-merged Conlang Export & Import feature — PR #18, verified complete in `git log`.)*

## Phase 1: Foundation

### Task 1: `feedback` schema, zod validation, and mutation ✅
- [x] Add `feedback` table to `src/server/db/schema.ts`: `id` (serial PK), `type` (pgEnum `bug`/`idea`/`other`), `message` (text, not null), `contactEmail` (varchar, nullable), `userId` (varchar, nullable), `createdAt` (timestamp, default now) — **ask-first, present diff before `db:push`**
- [x] Add `src/lib/feedback/schema.ts`: zod schema + `FeedbackInput` type
- [x] Add `insertFeedback()` to `src/server/mutations.ts`

**Acceptance criteria:**
- [x] Schema matches the shape above
- [x] zod schema rejects empty message, invalid email, and non-enum type; accepts valid input with/without `contactEmail`

**Verification:**
- [x] `npm test` passes (new `src/lib/feedback/schema.test.ts`, 12 tests)
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] Manual: `db:push` run with `TABLE_PREFIX=test_conlang-dictionary_` (drizzle-kit doesn't read `.env.local`, so the prefix was passed explicitly per user's choice); confirmed via `information_schema.columns` that `test_conlang-dictionary_feedback` exists with the expected columns

_Commit: `07d3c11`_

**Dependencies:** None

**Files:**
- `src/server/db/schema.ts`
- `src/lib/feedback/schema.ts` + `.test.ts` (new)
- `src/server/mutations.ts`

**Estimated scope:** Small (3 files)

---

## Checkpoint A
- [x] Schema change approved by user and `db:push` run
- [x] Unit tests pass

---

## Phase 2: Core capture flow

### Task 2: Server action + feedback modal UI ✅
- [x] `src/server/actions/feedback.ts`: `submitFeedback(input)` — validate, attach Clerk `userId` if present, insert
- [x] `src/app/_components/feedback-dialog.tsx`: `DialogDrawer` modal, type select + message + optional email, `react-hook-form` + `zodResolver` + `sonner`
- [x] `src/app/_components/footer.tsx`: add "Send feedback" trigger next to "Report an issue"

**Acceptance criteria:**
- [x] Valid submission succeeds (toast + dialog closes + DB row) — verified signed-in; mutation itself is unauthenticated by design (`userId` is nullable, no auth check), so signed-out works identically by construction
- [x] Empty message shows inline error, no server call
- [x] Signed-in submission attaches `userId` to the row
- [x] GitHub "Report an issue" link unchanged

**Verification:**
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] Manual (browser): valid submit while signed in → toast, dialog closed, row `{id:1, type:"bug", userId:"user_2fj..."}` confirmed via direct DB query; empty-message submit → inline "Message is required.", confirmed no new row (count stayed 1), no network request fired

_Commit: pending_

**Dependencies:** Task 1

**Files:**
- `src/server/actions/feedback.ts` (new)
- `src/app/_components/feedback-dialog.tsx` (new)
- `src/app/_components/footer.tsx`

**Estimated scope:** Medium (3 files)

---

## Checkpoint B
- [x] End-to-end DB-only flow verified in browser
- [x] Lint + build clean

---

## Phase 3: Email notification

### Task 3: Resend email notification
- [ ] Add `resend` dependency — **ask-first before `npm install`**
- [ ] Add `RESEND_API_KEY`, `FEEDBACK_NOTIFY_EMAIL` to `src/env.js` + `.env.example`
- [ ] `src/lib/feedback/build-notification-email.ts`: pure `FeedbackInput → { subject, text }`
- [ ] `src/server/email.ts`: Resend client + `sendFeedbackNotification()`
- [ ] Wire into `submitFeedback`, wrapped so email failure doesn't fail the submission

**Acceptance criteria:**
- [ ] Real email arrives at `FEEDBACK_NOTIFY_EMAIL` with type/message/contact/timestamp
- [ ] Address never appears client-side
- [ ] Submission still succeeds if the email send throws

**Verification:**
- [ ] `npm test` passes (new `build-notification-email.test.ts`)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual: one real end-to-end email received; verified not exposed via view-source/network tab; broken API key still allows submission to succeed

**Dependencies:** Task 2

**Files:**
- `src/lib/feedback/build-notification-email.ts` + `.test.ts` (new)
- `src/server/email.ts` (new)
- `src/server/actions/feedback.ts`
- `src/env.js`, `.env.example`

**Estimated scope:** Medium (5 files)

---

## Checkpoint C
- [ ] Email notification verified end-to-end
- [ ] Lint + build clean

---

## Phase 4: Spam hardening

### Task 4: Rate limiting + honeypot
- [ ] `submitFeedback`: check `ratelimit.limit(\`feedback_${ip}\`)` before validating/inserting
- [ ] `submitFeedback`: accept `honeypot`; if filled, return apparent success without DB write or email
- [ ] `feedback-dialog.tsx`: render honeypot field visually hidden, wired into payload

**Acceptance criteria:**
- [ ] Over-limit submissions show a friendly error, no crash
- [ ] Honeypot-filled submissions appear to succeed but create no row and send no email

**Verification:**
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual: honeypot-filled submit verified inert; 11+ rapid submissions trigger rate-limit error

**Dependencies:** Task 3

**Files:**
- `src/server/actions/feedback.ts`
- `src/app/_components/feedback-dialog.tsx`

**Estimated scope:** Small (2 files)

---

## Checkpoint: Complete
- [ ] All `SPEC.md` success criteria met
- [ ] Full test suite, lint, build all pass
- [ ] Ready for final review

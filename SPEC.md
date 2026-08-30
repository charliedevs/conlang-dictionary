# Spec: Anonymous Feedback Form

## Objective

Right now the only way to report a problem or suggest an idea is the footer's "Report an issue" link, which sends people to GitHub Issues — a hard wall for anyone without a GitHub account. This feature adds a second path: an in-app feedback form, open to signed-in and anonymous visitors alike, that lets someone submit a bug report, idea, or general comment without leaving the site or creating any account.

**User:** Any site visitor (signed-in or not) who wants to report a bug, suggest an idea, or leave feedback but doesn't have/want a GitHub account.

**Success looks like:** A visitor clicks "Send feedback" in the footer, fills a short form, and gets a clear confirmation. The submission is durably stored (so nothing is lost even if email delivery hiccups) and you get an email notification at your private dev-only address — which never appears anywhere in the site's HTML, JS, or public repo.

## Assumptions (confirmed with user)

- Open to anonymous visitors — no Clerk sign-in required.
- The existing GitHub Issues link stays; this is additive.
- Feedback entry point: a **modal** (via the existing `DialogDrawer` component), triggered from a new "Send feedback" link in the footer next to "Report an issue" — not a dedicated page.
- Fields: a **type** select (Bug / Idea / Other), a required message, and an **optional** email for reply-back. No required contact info.
- Spam protection: reuse the existing (currently unused) `src/server/ratelimit.ts` Upstash limiter, keyed by IP, plus a hidden honeypot field.
- Storage: a new `feedback` table is the source of truth; email is a best-effort notification on top, sent via **Resend** (no email library is currently installed; Resend fits this stack cleanly — API-based, no SMTP credentials, generous free tier, standard choice for Next.js/Vercel apps).
- The destination address lives only in a server-side env var (`FEEDBACK_NOTIFY_EMAIL`) — never sent to the client, never hardcoded in a public file.

## Tech Stack

- Next.js 14 App Router / TypeScript 5.4 — existing stack, no new framework pieces.
- **New dependency:** `resend` (npm package) for transactional email. *(Ask first — see Boundaries.)*
- Existing: Drizzle ORM + Postgres, `@upstash/ratelimit` + `@upstash/redis` (already configured, currently unused), `react-hook-form` + `zod` + `@hookform/resolvers`, shadcn/ui (`Dialog`/`Drawer` via `DialogDrawer`, `Form`, `Select`, `Textarea`, `Input`, `Button`), `sonner` for toasts, Clerk (`auth()`) to opportunistically attach a `userId` when the submitter happens to be signed in.

## Commands

```bash
npm install        # after adding `resend` to package.json
npm run dev         # dev server on :3000
npm run lint         # ESLint
npm run build         # production build
npm test              # Vitest, single run — covers new pure logic
npm run test:watch     # Vitest, watch mode
npm run db:push          # applies the new `feedback` table — approval required (see Boundaries)
```

New env vars (added to `.env.example` and `src/env.js`):
```bash
RESEND_API_KEY=your_resend_api_key_here
FEEDBACK_NOTIFY_EMAIL=your_dev_only_email_here   # never exposed to the client
```

## Project Structure

```
src/server/db/schema.ts                     → new `feedback` table (ask-first edit)
src/server/email.ts                         → Resend client init (mirrors ratelimit.ts's pattern)
src/server/actions/feedback.ts              → "use server" submitFeedback() action: rate limit → honeypot check → validate → insert → best-effort email
src/server/mutations.ts                     → insertFeedback() DB write
src/lib/feedback/schema.ts                  → zod schema + TS types shared by client form and server action (pure, testable)
src/lib/feedback/schema.test.ts             → unit tests for the zod schema (valid/invalid shapes, honeypot field present)
src/lib/feedback/build-notification-email.ts       → pure function: FeedbackInput → { subject, text } for the email body
src/lib/feedback/build-notification-email.test.ts  → unit tests for subject/body formatting per feedback type
src/app/_components/feedback-dialog.tsx     → client component: DialogDrawer + react-hook-form, calls submitFeedback()
src/app/_components/footer.tsx              → add "Send feedback" trigger next to "Report an issue"
```

## Code Style

Server action follows the existing `src/server/actions/lexical-category.ts` shape — plain async function, throws on failure, no auth requirement here (anonymous is allowed):

```ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { ratelimit } from "~/server/ratelimit";
import { sendFeedbackNotification } from "~/server/email";
import { insertFeedback } from "../mutations";
import { feedbackSchema, type FeedbackInput } from "~/lib/feedback/schema";

export async function submitFeedback(input: FeedbackInput & { honeypot: string }) {
  if (input.honeypot) return { ok: true }; // silently drop suspected bots

  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(`feedback_${ip}`);
  if (!success) throw new Error("Too many submissions. Please try again later.");

  const parsed = feedbackSchema.parse(input);
  const { userId } = auth();

  const feedback = await insertFeedback({ ...parsed, userId });

  try {
    await sendFeedbackNotification(parsed);
  } catch (error) {
    console.error("Feedback email failed to send:", error);
    // DB row already exists — don't fail the user's submission over email delivery
  }

  return { ok: true, id: feedback.id };
}
```

Form component follows `new-conlang-form.tsx`'s `react-hook-form` + `zodResolver` + `sonner` toast pattern, wrapped in the existing `DialogDrawer`.

## Testing Strategy

Per `CLAUDE.md`: TDD the pure logic, manually verify the untestable shell.

- **Unit tested (Vitest, TDD — write failing test first):**
  - `src/lib/feedback/schema.ts` — zod validation (message required/max length, type enum, optional email format).
  - `src/lib/feedback/build-notification-email.ts` — pure serializer producing the email subject/body from a feedback submission.
- **Not unit tested (no harness for these; verify via lint/build + manual browser check):**
  - `submitFeedback` server action (DB write, Resend call, rate limiter, Clerk `auth()`).
  - `feedback-dialog.tsx` (DOM/form glue).
  - Footer trigger wiring.
- **Manual verification in browser:**
  - Submit as signed-out visitor → success toast, dialog closes, row appears in DB, email arrives.
  - Submit with honeypot field populated (simulate via devtools) → appears to succeed to the caller, but no email sent and no real row inserted as "real" feedback.
  - Submit past the rate limit threshold → friendly error, no duplicate email.
  - Submit with an intentionally invalid payload (empty message) → inline validation error, no server round-trip.

## Boundaries

- **Always:**
  - Validate on both client (fast feedback) and server (authoritative) with the same zod schema.
  - Rate-limit by IP before touching the DB or Resend.
  - Keep `FEEDBACK_NOTIFY_EMAIL` and `RESEND_API_KEY` server-only (never in a `NEXT_PUBLIC_*` var, never in client-bundled code).
  - Treat stored feedback message as plain text — no HTML rendering path exists for it yet, so no sanitization gap is introduced. If a future admin UI ever renders it, that UI must sanitize per `CLAUDE.md`'s existing rich-text rule.
  - Fail the submission gracefully (still succeed to the user) if only the email send fails, since the DB row is the durable record.
- **Ask first:**
  - Editing `src/server/db/schema.ts` to add the `feedback` table (existing project-wide rule).
  - Running `npm run db:push` against the real database (existing project-wide rule).
  - Adding the `resend` npm dependency.
  - Creating/configuring the actual Resend account, API key, and sender domain (external service setup outside this repo).
- **Never:**
  - Expose the notification email address in any client-rendered output, response payload, or public file.
  - Bypass the honeypot/rate-limit checks "just for testing" in a way that ships to production.
  - Send real submissions to the developer's actual inbox during automated/scripted testing — use a disposable/dev Resend recipient or mock the send during verification passes beyond the one manual end-to-end check.

## Success Criteria

- [ ] A signed-out visitor can open the feedback modal from the footer, submit a bug/idea/other message with no email required, and see a success confirmation.
- [ ] The submission is persisted in the new `feedback` table regardless of email outcome.
- [ ] A real email notification arrives at `FEEDBACK_NOTIFY_EMAIL` containing the type, message, optional reply-to email, and submission time — with that address never appearing in any client-visible source.
- [ ] A submission with the honeypot field filled in does not trigger a real email and does not appear as genuine feedback, while still returning a normal-looking success response to the caller.
- [ ] Rapid repeated submissions from one IP beyond the rate limit are rejected with a clear, non-crashing error.
- [ ] `npm run lint` and `npm run build` pass; `npm test` passes including new schema/email-formatting unit tests.
- [ ] Existing "Report an issue" GitHub link is unchanged.

## Open Questions

1. **Resend sender domain:** use Resend's shared `onboarding@resend.dev` sender for now (zero setup, fine for a low-volume notification email), or do you have a domain you want to verify with Resend for a branded "from" address? Defaults to the shared sender unless you say otherwise.
2. **Feedback table retention/admin view:** this spec only covers capture + notification. Building an in-app admin list to browse past feedback is out of scope here — flag if you want that as a fast-follow.
3. **Rate limit threshold:** reusing `ratelimit.ts`'s existing `10 requests / 100s` window (shared limiter config) keyed per-feature (`feedback_{ip}`) rather than a bespoke stricter limit for this form. Fine, or should feedback have a tighter limit (e.g. 3/hour) since it's a low-frequency action?

# Known Issues

Real defects found but deliberately deferred. Each entry has enough detail to fix without
rediscovering the diagnosis. Not a wishlist — only things confirmed broken.

---

## Emoji input switches from uncontrolled to controlled

**Found:** 2026-08-30, during the Clerk v6 upgrade verification pass.
**Scope:** out of scope for the Clerk work. Pre-existing; unrelated to auth.
**Severity:** low — console warning only, no user-visible breakage.

**Symptom:** browser console warns that a controlled input is changing to uncontrolled (or vice
versa) when creating or editing a conlang and picking an emoji.

**Root cause:** both forms set `emoji` to `undefined` in react-hook-form `defaultValues`, then
spread `{...field}` into the shadcn `<Input>`. `value` is `undefined` on first render, which React
treats as *uncontrolled*; when the emoji picker calls `form.setValue("emoji", …)` the value becomes
a string and the input becomes *controlled*. React warns on that transition.

- `src/app/dashboard/_components/new-conlang-form.tsx` — `defaultValues` ~line 52, `FormField` render ~line 162
- `src/app/dashboard/_components/edit-conlang-form.tsx` — `defaultValues` ~line 52, `FormField` render ~line 152

**Fix (at the render layer, not `defaultValues`):** pass `value={field.value ?? ""}` after the
`{...field}` spread on the emoji `<Input>` in both files.

**Why not just set `defaultValues.emoji = ""`:** the zod schema is
`z.string().emoji().max(6).optional()`, so an empty string would fail `.emoji()` validation if it
ever reached submit. Keeping `""` confined to the view preserves "no emoji" as `undefined` in form
state.

**Verify:** `npm run lint && npm run build`, then create and edit a conlang with and without an
emoji, confirming no console warning and that submitting with no emoji still sends `undefined`.

---

## Upstash rate limiting is non-functional

**Found:** during the anonymous feedback form work (see `tasks/todo-anonymous-feedback-form.md`).
**Severity:** medium — the feedback form has no working rate limit.

The configured Redis host `usw2-regular-polecat-31793.upstash.io` fails DNS resolution
(`ENOTFOUND`), which looks like a deleted or stale Upstash database rather than a config error. The
`ratelimit.limit()` call degrades safely — submissions still succeed when Upstash is unreachable —
so the feedback form works, just unthrottled.

**Fix:** needs the Upstash dashboard — create or restore a Redis database and update
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Then verify the documented threshold
(10 requests / 100s) actually blocks the 11th rapid submission.

**Relevant to the Clerk work:** the feedback modal is the manual-recovery path offered to any user
whose account cannot be auto-reclaimed after the production cutover, so it should have a working
rate limit before that traffic arrives.

---

## Cookie `_cfuvid` rejected for invalid domain

**Found:** 2026-08-30, same verification pass.
**Severity:** none — cosmetic browser console noise.

Third-party cookie set by Cloudflare in front of Clerk's `accounts.dev` domain, rejected by the
browser because it does not match the page origin. Not emitted by this application and not
actionable from the code side. Expected to disappear on its own once the production Clerk instance
serves auth from `clerk.conlangdictionary.com` instead of `*.accounts.dev` (see `tasks/plan.md`
Phase 4). No fix required; recorded so it is not re-investigated.

/**
 * Decides what a signed-in Clerk identity means for our local `users` table.
 *
 * This is the function the production cutover rests on. After the Clerk
 * instance swap every user arrives with a brand new `clerkUserId`, and this
 * decides whether they are the same person as an existing row — and therefore
 * whether they get their conlangs back.
 *
 * Deliberately pure and total: it performs no I/O, never throws, and returns a
 * discriminated union so every caller has to handle the ambiguous case. The
 * safe answer is always to create a new account rather than hand someone an
 * existing one, so anything short of certainty resolves to `create` or
 * `conflict` — never a guess.
 */

export interface ClerkIdentity {
  clerkUserId: string;
  email: string | null;
  /** Clerk's own verification state for the primary address. */
  emailVerified: boolean;
}

/** The subset of a `users` row this decision needs. */
export interface UserRow {
  id: string;
  clerkUserId: string | null;
  email: string | null;
}

export type ResolveUserResult =
  /** This clerk id is already mapped. Nothing to do. */
  | { kind: "existing"; user: UserRow }
  /** Same person, new clerk id — adopt the row and rewrite its clerkUserId. */
  | { kind: "reclaim"; user: UserRow; previousClerkUserId: string | null }
  /** Nobody we recognise. Create a fresh row. */
  | { kind: "create" }
  /** Ambiguous. Do not link anything; escalate for manual resolution. */
  | { kind: "conflict"; reason: string; candidateIds: string[] };

/** Matching is case- and whitespace-insensitive, everywhere, in both directions. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function resolveUser(input: {
  identity: ClerkIdentity;
  /** The row already carrying this clerk id, if any. */
  byClerkId: UserRow | null;
  /** Rows the caller believes share this email. Re-checked here, not trusted. */
  byEmail: UserRow[];
}): ResolveUserResult {
  const { identity, byClerkId, byEmail } = input;

  if (identity.clerkUserId.trim() === "") {
    return {
      kind: "conflict",
      reason: "Identity has a blank clerk user id.",
      candidateIds: [],
    };
  }

  // The clerk id is the strongest signal available: it survives an email
  // change, which an email match by definition does not.
  if (byClerkId !== null) return { kind: "existing", user: byClerkId };

  // The account-takeover guard. An unverified address proves nothing about who
  // controls it, so it must never be enough to adopt an existing account.
  if (identity.email === null || !identity.emailVerified)
    return { kind: "create" };

  const wanted = normalizeEmail(identity.email);
  if (wanted === "") return { kind: "create" };

  // Re-filter rather than trusting the caller's query: a wrong collation or a
  // stale parameter must not be able to hand somebody another user's account.
  const matches = byEmail.filter(
    (row) => row.email !== null && normalizeEmail(row.email) === wanted,
  );

  if (matches.length === 0) return { kind: "create" };

  if (matches.length > 1) {
    return {
      kind: "conflict",
      reason: `Email is shared by more than one user row (${matches.length}).`,
      candidateIds: matches.map((row) => row.id),
    };
  }

  const user = matches[0]!;
  return { kind: "reclaim", user, previousClerkUserId: user.clerkUserId };
}

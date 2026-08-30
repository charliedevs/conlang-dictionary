// Decides whether a Clerk identity is an existing local user, someone reclaiming
// their account after the instance cutover, or a new signup.

export interface ClerkIdentity {
  clerkUserId: string;
  email: string | null;
  emailVerified: boolean;
}

export interface UserRow {
  id: string;
  clerkUserId: string | null;
  email: string | null;
}

export type ResolveUserResult =
  | { kind: "existing"; user: UserRow }
  | { kind: "reclaim"; user: UserRow; previousClerkUserId: string | null }
  | { kind: "create" }
  | { kind: "conflict"; reason: string; candidateIds: string[] };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function resolveUser(input: {
  identity: ClerkIdentity;
  byClerkId: UserRow | null;
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

  // Survives an email change, so it wins over an email match.
  if (byClerkId !== null) return { kind: "existing", user: byClerkId };

  // Account-takeover guard: an unverified address must never adopt an account.
  if (identity.email === null || !identity.emailVerified)
    return { kind: "create" };

  const wanted = normalizeEmail(identity.email);
  if (wanted === "") return { kind: "create" };

  // Re-filtered rather than trusting the caller's query.
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

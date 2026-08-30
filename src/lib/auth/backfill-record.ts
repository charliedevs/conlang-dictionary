/**
 * Maps a snapshot record (see src/lib/clerk-export/extract-user.ts) onto the
 * row shape the local `users` table stores.
 *
 * The backfill reads the Phase 0 JSON snapshot rather than calling Clerk again,
 * so the same input always produces the same rows and the migration can be
 * re-run and re-verified without depending on Clerk still being reachable.
 *
 * Returns a discriminated result rather than throwing: a record the schema
 * cannot accept is reported so the caller can skip it and surface it, instead
 * of aborting the whole backfill transaction on a constraint violation.
 */

import type { ExportedUser } from "../clerk-export/extract-user";

/** Mirrors the varchar widths declared for `users` in src/server/db/schema.ts. */
export const MAX_EMAIL_LENGTH = 320;
export const MAX_NAME_LENGTH = 256;

export interface UserRecord {
  clerkUserId: string;
  /** Stored as Clerk supplied it; matching happens on `lower(email)`. */
  email: string;
  emailVerified: boolean;
  username: string | null;
  displayName: string | null;
  imageUrl: string | null;
}

export type ToUserRecordResult =
  | { ok: true; record: UserRecord }
  | { ok: false; clerkUserId: string; problems: string[] };

/** Collapses absent, empty, and whitespace-only values to a single null. */
function blankToNull(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function toUserRecord(user: ExportedUser): ToUserRecordResult {
  const email = blankToNull(user.email);
  const username = blankToNull(user.username);
  const displayName = blankToNull(user.displayName);

  const problems: string[] = [];

  // `users.email` is NOT NULL by design — every sign-in method we keep supplies
  // an address, and the schema is deliberately not shaped around legacy
  // accounts that have none.
  if (email === null) problems.push("email is missing");
  else if (email.length > MAX_EMAIL_LENGTH)
    problems.push(`email exceeds ${MAX_EMAIL_LENGTH} characters`);

  if (username !== null && username.length > MAX_NAME_LENGTH)
    problems.push(`username exceeds ${MAX_NAME_LENGTH} characters`);
  if (displayName !== null && displayName.length > MAX_NAME_LENGTH)
    problems.push(`displayName exceeds ${MAX_NAME_LENGTH} characters`);

  if (email === null || problems.length > 0) {
    return { ok: false, clerkUserId: user.clerkUserId, problems };
  }

  return {
    ok: true,
    record: {
      clerkUserId: user.clerkUserId,
      email,
      // Verification describes an address, and a stray `true` here would weaken
      // the reclaim guard in resolve-user.ts.
      emailVerified: user.emailVerified,
      username,
      displayName,
      imageUrl: blankToNull(user.imageUrl),
    },
  };
}

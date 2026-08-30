/**
 * Maps a snapshot record (see src/lib/clerk-export/extract-user.ts) onto the
 * row shape the local `users` table stores.
 *
 * The backfill reads the Phase 0 JSON snapshot rather than calling Clerk again,
 * so the same input always produces the same rows and the migration can be
 * re-run and re-verified without depending on Clerk still being reachable.
 */

import type { ExportedUser } from "../clerk-export/extract-user";

/** Mirrors the varchar widths proposed for the `users` table in Task 2.2. */
export const MAX_EMAIL_LENGTH = 320;
export const MAX_NAME_LENGTH = 256;

export interface UserRecord {
  clerkUserId: string;
  /** Stored as Clerk supplied it; matching happens on `lower(email)`. */
  email: string | null;
  emailVerified: boolean;
  username: string | null;
  displayName: string | null;
  imageUrl: string | null;
  /**
   * Fields exceeding their column width. Non-empty means the caller must skip
   * or repair this record — inserting it would abort the whole backfill.
   */
  tooLong: string[];
}

/** Collapses absent, empty, and whitespace-only values to a single null. */
function blankToNull(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function toUserRecord(user: ExportedUser): UserRecord {
  const email = blankToNull(user.email);
  const username = blankToNull(user.username);
  const displayName = blankToNull(user.displayName);

  const tooLong: string[] = [];
  if (email !== null && email.length > MAX_EMAIL_LENGTH) tooLong.push("email");
  if (username !== null && username.length > MAX_NAME_LENGTH)
    tooLong.push("username");
  if (displayName !== null && displayName.length > MAX_NAME_LENGTH)
    tooLong.push("displayName");

  return {
    clerkUserId: user.clerkUserId,
    email,
    // Verification describes an address; with no address there is nothing
    // verified, and a stray `true` here would weaken the reclaim guard.
    emailVerified: email !== null && user.emailVerified,
    username,
    displayName,
    imageUrl: blankToNull(user.imageUrl),
    tooLong,
  };
}

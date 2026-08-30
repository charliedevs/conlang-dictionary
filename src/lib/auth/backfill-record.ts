// Maps a snapshot record onto a `users` row, reporting records the schema rejects.

import type { ExportedUser } from "../clerk-export/extract-user";

// Must match the varchar widths in src/server/db/schema.ts.
export const MAX_EMAIL_LENGTH = 320;
export const MAX_NAME_LENGTH = 256;

export interface UserRecord {
  clerkUserId: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  displayName: string | null;
  imageUrl: string | null;
}

export type ToUserRecordResult =
  | { ok: true; record: UserRecord }
  | { ok: false; clerkUserId: string; problems: string[] };

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
      emailVerified: user.emailVerified,
      username,
      displayName,
      imageUrl: blankToNull(user.imageUrl),
    },
  };
}

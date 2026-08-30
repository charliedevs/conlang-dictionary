/**
 * Reclaim-readiness statistics over an exported Clerk user set.
 *
 * Returns data rather than printing, so the classification can be tested
 * independently of the script that renders it.
 */

import type { ExportedUser } from "./extract-user";

const APPLE_RELAY_DOMAIN = "@privaterelay.appleid.com";
const NO_PROVIDER_LABEL = "(none — email/password)";

export interface UserSummary {
  total: number;
  /** Verified email present — will auto-reclaim after cutover. */
  reclaimable: number;
  /** Email present but unverified — deliberately will NOT auto-reclaim. */
  unverified: number;
  /** No email at all — cannot be matched by any email route. */
  noEmail: ExportedUser[];
  duplicateEmails: { email: string; count: number }[];
  providerCounts: { providers: string; count: number }[];
  appleOnly: number;
  appleOnlyRelay: number;
}

/** Reclaim matches case-insensitively, so every comparison here must too. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function summarizeUsers(users: ExportedUser[]): UserSummary {
  const byEmail = new Map<string, number>();
  for (const u of users) {
    if (u.email === null) continue;
    const key = normalizeEmail(u.email);
    byEmail.set(key, (byEmail.get(key) ?? 0) + 1);
  }

  const providerCounts = new Map<string, number>();
  for (const u of users) {
    // Copy before sorting — `sort` mutates in place, and the caller's array
    // must not be reordered as a side effect of counting.
    const key =
      u.providers.length > 0
        ? [...u.providers].sort().join("+")
        : NO_PROVIDER_LABEL;
    providerCounts.set(key, (providerCounts.get(key) ?? 0) + 1);
  }

  const appleOnlyUsers = users.filter(
    (u) =>
      u.providers.length > 0 && u.providers.every((p) => p === "oauth_apple"),
  );

  return {
    total: users.length,
    reclaimable: users.filter((u) => u.email !== null && u.emailVerified)
      .length,
    unverified: users.filter((u) => u.email !== null && !u.emailVerified)
      .length,
    noEmail: users.filter((u) => u.email === null),
    duplicateEmails: [...byEmail.entries()]
      .filter(([, count]) => count > 1)
      .map(([email, count]) => ({ email, count })),
    providerCounts: [...providerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([providers, count]) => ({ providers, count })),
    appleOnly: appleOnlyUsers.length,
    appleOnlyRelay: appleOnlyUsers.filter((u) =>
      normalizeEmail(u.email ?? "").endsWith(APPLE_RELAY_DOMAIN),
    ).length,
  };
}

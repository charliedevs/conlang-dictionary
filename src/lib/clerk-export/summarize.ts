// Reclaim-readiness statistics over an exported Clerk user set.

import type { ExportedUser } from "./extract-user";

const APPLE_RELAY_DOMAIN = "@privaterelay.appleid.com";
const NO_PROVIDER_LABEL = "(none: email/password)";

export interface UserSummary {
  total: number;
  reclaimable: number;
  unverified: number;
  noEmail: ExportedUser[];
  duplicateEmails: { email: string; count: number }[];
  providerCounts: { providers: string; count: number }[];
  appleOnly: number;
  appleOnlyRelay: number;
}

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
    // Copy before sorting: `sort` mutates in place.
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

// Pure transforms for the Clerk identity export.

export interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification: { status: string | null } | null;
}

export interface ClerkExternalAccount {
  provider: string | null;
  provider_user_id: string | null;
  email_address: string | null;
  verification: { status: string | null } | null;
}

export interface ClerkApiUser {
  id: string;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[] | null;
  external_accounts: ClerkExternalAccount[] | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: number | null;
  last_sign_in_at: number | null;
}

export interface ExportedUser {
  clerkUserId: string;
  email: string | null;
  emailVerified: boolean;
  allEmails: string[];
  username: string | null;
  displayName: string | null;
  imageUrl: string | null;
  providers: string[];
  externalAccounts: {
    provider: string;
    providerUserId: string | null;
    email: string | null;
  }[];
  createdAt: string | null;
  lastSignInAt: string | null;
}

export function instanceKind(
  secretKey: string,
): "development" | "production" | "unknown" {
  if (secretKey.startsWith("sk_test_")) return "development";
  if (secretKey.startsWith("sk_live_")) return "production";
  return "unknown";
}

export function toIso(epochMs: number | null | undefined): string | null {
  if (epochMs === null || epochMs === undefined) return null;
  if (!Number.isFinite(epochMs)) return null;
  return new Date(epochMs).toISOString();
}

// `emailVerified` describes the address actually chosen, never "some address on
// this account is verified".
export function extractUser(user: ClerkApiUser): ExportedUser {
  const emails = user.email_addresses ?? [];
  const primary =
    emails.find((e) => e.id === user.primary_email_address_id) ??
    emails.find((e) => e.verification?.status === "verified") ??
    emails[0];

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || null;

  return {
    clerkUserId: user.id,
    email: primary?.email_address ?? null,
    emailVerified: primary?.verification?.status === "verified",
    allEmails: emails.map((e) => e.email_address),
    username: user.username,
    displayName,
    imageUrl: user.image_url,
    providers: (user.external_accounts ?? [])
      .map((a) => a.provider)
      .filter((p): p is string => typeof p === "string"),
    externalAccounts: (user.external_accounts ?? []).map((a) => ({
      provider: a.provider ?? "unknown",
      providerUserId: a.provider_user_id,
      email: a.email_address === "" ? null : a.email_address,
    })),
    createdAt: toIso(user.created_at),
    lastSignInAt: toIso(user.last_sign_in_at),
  };
}

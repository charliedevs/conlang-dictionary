import { describe, expect, it } from "vitest";
import { extractUser, instanceKind, toIso } from "./extract-user";
import type { ClerkApiUser } from "./extract-user";

function clerkUser(overrides: Partial<ClerkApiUser> = {}): ClerkApiUser {
  return {
    id: "user_abc",
    primary_email_address_id: "idn_1",
    email_addresses: [
      {
        id: "idn_1",
        email_address: "a@example.com",
        verification: { status: "verified" },
      },
    ],
    external_accounts: [],
    username: null,
    first_name: null,
    last_name: null,
    image_url: null,
    created_at: 1_700_000_000_000,
    last_sign_in_at: null,
    ...overrides,
  };
}

describe("instanceKind", () => {
  it("recognises development and production secret keys", () => {
    expect(instanceKind("sk_test_abc")).toBe("development");
    expect(instanceKind("sk_live_abc")).toBe("production");
  });

  it("returns unknown rather than guessing for an unrecognised prefix", () => {
    expect(instanceKind("whatever")).toBe("unknown");
  });
});

describe("toIso", () => {
  it("converts an epoch to an ISO string", () => {
    expect(toIso(1_700_000_000_000)).toBe("2023-11-14T22:13:20.000Z");
  });

  it("returns null for a null timestamp", () => {
    expect(toIso(null)).toBeNull();
  });

  // Clerk omits fields rather than nulling them; `undefined` must not throw.
  it("returns null for an absent timestamp instead of throwing", () => {
    expect(toIso(undefined)).toBeNull();
  });

  it("returns null for a non-finite timestamp instead of throwing", () => {
    expect(toIso(Number.NaN)).toBeNull();
    expect(toIso(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("extractUser — email selection", () => {
  it("prefers the address named by primary_email_address_id", () => {
    const u = extractUser(
      clerkUser({
        primary_email_address_id: "idn_2",
        email_addresses: [
          {
            id: "idn_1",
            email_address: "first@example.com",
            verification: { status: "verified" },
          },
          {
            id: "idn_2",
            email_address: "primary@example.com",
            verification: { status: "verified" },
          },
        ],
      }),
    );
    expect(u.email).toBe("primary@example.com");
    expect(u.emailVerified).toBe(true);
  });

  it("falls back to a verified address when the primary id matches nothing", () => {
    const u = extractUser(
      clerkUser({
        primary_email_address_id: "idn_missing",
        email_addresses: [
          {
            id: "idn_1",
            email_address: "unverified@example.com",
            verification: { status: "unverified" },
          },
          {
            id: "idn_2",
            email_address: "verified@example.com",
            verification: { status: "verified" },
          },
        ],
      }),
    );
    expect(u.email).toBe("verified@example.com");
    expect(u.emailVerified).toBe(true);
  });

  it("falls back to the first address when none is verified", () => {
    const u = extractUser(
      clerkUser({
        primary_email_address_id: null,
        email_addresses: [
          {
            id: "idn_1",
            email_address: "one@example.com",
            verification: { status: "unverified" },
          },
        ],
      }),
    );
    expect(u.email).toBe("one@example.com");
    expect(u.emailVerified).toBe(false);
  });

  // The account-takeover guard depends on this never being optimistic.
  it("reports an unverified primary as unverified even when another address is verified", () => {
    const u = extractUser(
      clerkUser({
        primary_email_address_id: "idn_1",
        email_addresses: [
          {
            id: "idn_1",
            email_address: "primary@example.com",
            verification: { status: "unverified" },
          },
          {
            id: "idn_2",
            email_address: "other@example.com",
            verification: { status: "verified" },
          },
        ],
      }),
    );
    expect(u.email).toBe("primary@example.com");
    expect(u.emailVerified).toBe(false);
  });

  it("handles an account with no email addresses at all", () => {
    const u = extractUser(
      clerkUser({ primary_email_address_id: null, email_addresses: [] }),
    );
    expect(u.email).toBeNull();
    expect(u.emailVerified).toBe(false);
    expect(u.allEmails).toEqual([]);
  });

  it("treats a null verification block as unverified", () => {
    const u = extractUser(
      clerkUser({
        email_addresses: [
          { id: "idn_1", email_address: "a@example.com", verification: null },
        ],
      }),
    );
    expect(u.emailVerified).toBe(false);
  });

  it("records every address, not just the primary", () => {
    const u = extractUser(
      clerkUser({
        email_addresses: [
          {
            id: "idn_1",
            email_address: "a@example.com",
            verification: { status: "verified" },
          },
          {
            id: "idn_2",
            email_address: "b@example.com",
            verification: { status: "verified" },
          },
        ],
      }),
    );
    expect(u.allEmails).toEqual(["a@example.com", "b@example.com"]);
  });
});

describe("extractUser — display name", () => {
  it("joins first and last name", () => {
    expect(
      extractUser(clerkUser({ first_name: "Ada", last_name: "Lovelace" }))
        .displayName,
    ).toBe("Ada Lovelace");
  });

  it("uses whichever name is present", () => {
    expect(
      extractUser(clerkUser({ first_name: "Ada", last_name: null }))
        .displayName,
    ).toBe("Ada");
    expect(
      extractUser(clerkUser({ first_name: null, last_name: "Lovelace" }))
        .displayName,
    ).toBe("Lovelace");
  });

  it("returns null when both names are absent", () => {
    expect(extractUser(clerkUser()).displayName).toBeNull();
  });

  it("returns null for whitespace-only names rather than a blank string", () => {
    expect(
      extractUser(clerkUser({ first_name: "  ", last_name: null })).displayName,
    ).toBeNull();
  });
});

describe("extractUser — external accounts", () => {
  it("captures provider and provider_user_id for each linked account", () => {
    const u = extractUser(
      clerkUser({
        external_accounts: [
          {
            provider: "oauth_google",
            provider_user_id: "1165047",
            email_address: "a@gmail.com",
            verification: null,
          },
        ],
      }),
    );
    expect(u.providers).toEqual(["oauth_google"]);
    expect(u.externalAccounts).toEqual([
      {
        provider: "oauth_google",
        providerUserId: "1165047",
        email: "a@gmail.com",
      },
    ]);
  });

  it("normalises Clerk's empty-string email to null", () => {
    const u = extractUser(
      clerkUser({
        external_accounts: [
          {
            provider: "oauth_apple",
            provider_user_id: "001563.abc",
            email_address: "",
            verification: null,
          },
        ],
      }),
    );
    expect(u.externalAccounts[0]!.email).toBeNull();
  });

  it("drops a null provider from providers but keeps the account", () => {
    const u = extractUser(
      clerkUser({
        external_accounts: [
          {
            provider: null,
            provider_user_id: "x",
            email_address: null,
            verification: null,
          },
        ],
      }),
    );
    expect(u.providers).toEqual([]);
    expect(u.externalAccounts).toHaveLength(1);
    expect(u.externalAccounts[0]!.provider).toBe("unknown");
  });

  it("handles an absent external_accounts array", () => {
    const u = extractUser(clerkUser({ external_accounts: null }));
    expect(u.providers).toEqual([]);
    expect(u.externalAccounts).toEqual([]);
  });
});

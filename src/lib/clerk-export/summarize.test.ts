import { describe, expect, it } from "vitest";
import { summarizeUsers } from "./summarize";
import type { ExportedUser } from "./extract-user";

function user(overrides: Partial<ExportedUser> = {}): ExportedUser {
  return {
    clerkUserId: "user_1",
    email: "a@example.com",
    emailVerified: true,
    allEmails: ["a@example.com"],
    username: null,
    displayName: null,
    imageUrl: null,
    providers: ["oauth_google"],
    externalAccounts: [],
    createdAt: null,
    lastSignInAt: null,
    ...overrides,
  };
}

describe("summarizeUsers: reclaim readiness", () => {
  it("counts a verified email as reclaimable", () => {
    const s = summarizeUsers([user()]);
    expect(s.reclaimable).toBe(1);
    expect(s.unverified).toBe(0);
    expect(s.noEmail).toHaveLength(0);
  });

  it("counts an unverified email as not reclaimable", () => {
    const s = summarizeUsers([user({ emailVerified: false })]);
    expect(s.reclaimable).toBe(0);
    expect(s.unverified).toBe(1);
  });

  it("lists accounts with no email separately from unverified ones", () => {
    const s = summarizeUsers([user({ email: null, emailVerified: false })]);
    expect(s.noEmail.map((u) => u.clerkUserId)).toEqual(["user_1"]);
    expect(s.unverified).toBe(0);
    expect(s.reclaimable).toBe(0);
  });

  it("partitions every user into exactly one bucket", () => {
    const users = [
      user({ clerkUserId: "a" }),
      user({ clerkUserId: "b", emailVerified: false }),
      user({ clerkUserId: "c", email: null, emailVerified: false }),
    ];
    const s = summarizeUsers(users);
    expect(s.reclaimable + s.unverified + s.noEmail.length).toBe(users.length);
  });
});

describe("summarizeUsers: duplicate emails", () => {
  it("reports an address shared by two accounts", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", email: "same@example.com" }),
      user({ clerkUserId: "b", email: "same@example.com" }),
    ]);
    expect(s.duplicateEmails).toEqual([
      { email: "same@example.com", count: 2 },
    ]);
  });

  // Reclaim matches case-insensitively, so detection must too, otherwise a
  // genuine collision is reported as two distinct addresses and slips through.
  it("treats addresses differing only in case as duplicates", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", email: "Same@Example.com" }),
      user({ clerkUserId: "b", email: "same@example.com" }),
    ]);
    expect(s.duplicateEmails).toEqual([
      { email: "same@example.com", count: 2 },
    ]);
  });

  it("ignores surrounding whitespace when comparing", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", email: " same@example.com " }),
      user({ clerkUserId: "b", email: "same@example.com" }),
    ]);
    expect(s.duplicateEmails).toHaveLength(1);
  });

  it("reports nothing when all addresses are distinct", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", email: "a@example.com" }),
      user({ clerkUserId: "b", email: "b@example.com" }),
    ]);
    expect(s.duplicateEmails).toEqual([]);
  });
});

describe("summarizeUsers: Apple exposure", () => {
  it("counts accounts whose only provider is Apple", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", providers: ["oauth_apple"] }),
      user({ clerkUserId: "b", providers: ["oauth_google"] }),
    ]);
    expect(s.appleOnly).toBe(1);
  });

  it("does not count an account that also has Google", () => {
    const s = summarizeUsers([
      user({ providers: ["oauth_apple", "oauth_google"] }),
    ]);
    expect(s.appleOnly).toBe(0);
  });

  it("identifies Apple private-relay addresses", () => {
    const s = summarizeUsers([
      user({
        providers: ["oauth_apple"],
        email: "abc@privaterelay.appleid.com",
      }),
    ]);
    expect(s.appleOnlyRelay).toBe(1);
  });

  // Email domains are case-insensitive; a capitalised relay address is still a
  // relay address, and miscounting it understates who needs an email-code path.
  it("identifies a relay address regardless of case", () => {
    const s = summarizeUsers([
      user({
        providers: ["oauth_apple"],
        email: "ABC@PrivateRelay.AppleID.com",
      }),
    ]);
    expect(s.appleOnlyRelay).toBe(1);
  });

  it("does not mistake a lookalike domain for a relay address", () => {
    const s = summarizeUsers([
      user({
        providers: ["oauth_apple"],
        email: "abc@notprivaterelay.appleid.com.evil.test",
      }),
    ]);
    expect(s.appleOnlyRelay).toBe(0);
  });
});

describe("summarizeUsers: provider breakdown", () => {
  it("groups accounts by their provider combination", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", providers: ["oauth_google"] }),
      user({ clerkUserId: "b", providers: ["oauth_google"] }),
      user({ clerkUserId: "c", providers: ["oauth_github"] }),
    ]);
    expect(s.providerCounts).toEqual([
      { providers: "oauth_google", count: 2 },
      { providers: "oauth_github", count: 1 },
    ]);
  });

  it("treats provider order as insignificant when grouping", () => {
    const s = summarizeUsers([
      user({ clerkUserId: "a", providers: ["oauth_github", "oauth_google"] }),
      user({ clerkUserId: "b", providers: ["oauth_google", "oauth_github"] }),
    ]);
    expect(s.providerCounts).toEqual([
      { providers: "oauth_github+oauth_google", count: 2 },
    ]);
  });

  // Sorting the key must not reorder the caller's array.
  it("does not mutate the input user's providers array", () => {
    const u = user({ providers: ["oauth_google", "oauth_github"] });
    summarizeUsers([u]);
    expect(u.providers).toEqual(["oauth_google", "oauth_github"]);
  });

  it("labels accounts with no linked provider", () => {
    const s = summarizeUsers([user({ providers: [] })]);
    expect(s.providerCounts).toEqual([
      { providers: "(none: email/password)", count: 1 },
    ]);
  });
});

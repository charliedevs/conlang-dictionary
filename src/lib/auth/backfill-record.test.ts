import { describe, expect, it } from "vitest";
import { toUserRecord } from "./backfill-record";
import type { ExportedUser } from "../clerk-export/extract-user";

const exported = (o: Partial<ExportedUser> = {}): ExportedUser => ({
  clerkUserId: "user_1",
  email: "a@example.com",
  emailVerified: true,
  allEmails: ["a@example.com"],
  username: null,
  displayName: null,
  imageUrl: null,
  providers: [],
  externalAccounts: [],
  createdAt: null,
  lastSignInAt: null,
  ...o,
});

describe("toUserRecord", () => {
  it("carries the identifying fields across", () => {
    expect(
      toUserRecord(
        exported({
          clerkUserId: "user_9",
          email: "p@example.com",
          emailVerified: true,
        }),
      ),
    ).toMatchObject({
      clerkUserId: "user_9",
      email: "p@example.com",
      emailVerified: true,
    });
  });

  // Reclaim matches on lower(email); storing the address as Clerk gave it keeps
  // it usable for display and for actually sending mail.
  it("preserves email case but trims surrounding whitespace", () => {
    expect(
      toUserRecord(exported({ email: "  Person@Example.COM  " })).email,
    ).toBe("Person@Example.COM");
  });

  // The account with no email still needs a row — it owns a conlang, and the
  // ownership mapping is what keeps that conlang attached to anything at all.
  it("still produces a record when there is no email", () => {
    const r = toUserRecord(exported({ email: null, emailVerified: false }));
    expect(r.email).toBeNull();
    expect(r.emailVerified).toBe(false);
    expect(r.clerkUserId).toBe("user_1");
  });

  it("never marks a record verified when it has no email", () => {
    expect(
      toUserRecord(exported({ email: null, emailVerified: true }))
        .emailVerified,
    ).toBe(false);
  });

  it("normalises blank names and usernames to null", () => {
    const r = toUserRecord(
      exported({ username: "   ", displayName: "  ", imageUrl: "" }),
    );
    expect(r.username).toBeNull();
    expect(r.displayName).toBeNull();
    expect(r.imageUrl).toBeNull();
  });

  it("trims names and usernames that have content", () => {
    const r = toUserRecord(
      exported({ username: " ada ", displayName: " Ada Lovelace " }),
    );
    expect(r.username).toBe("ada");
    expect(r.displayName).toBe("Ada Lovelace");
  });

  it("keeps the image url when present", () => {
    expect(
      toUserRecord(exported({ imageUrl: "https://img.clerk.com/x" })).imageUrl,
    ).toBe("https://img.clerk.com/x");
  });

  it("does not carry provider data onto the user row", () => {
    const r = toUserRecord(exported({ providers: ["oauth_google"] }));
    expect(r).not.toHaveProperty("providers");
    expect(r).not.toHaveProperty("externalAccounts");
  });
});

describe("toUserRecord — column length limits", () => {
  // varchar(320)/varchar(256) — silently over-long values would abort the whole
  // backfill transaction, so they are reported rather than truncated.
  it("flags an email longer than the column allows", () => {
    const long = "a".repeat(320) + "@example.com";
    expect(toUserRecord(exported({ email: long })).tooLong).toEqual(["email"]);
  });

  it("flags an over-long username and display name together", () => {
    const long = "x".repeat(300);
    expect(
      toUserRecord(exported({ username: long, displayName: long })).tooLong,
    ).toEqual(["username", "displayName"]);
  });

  it("reports nothing for values within the limits", () => {
    expect(toUserRecord(exported()).tooLong).toEqual([]);
  });
});

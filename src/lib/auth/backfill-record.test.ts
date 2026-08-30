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

describe("toUserRecord: accepted records", () => {
  it("carries the identifying fields across", () => {
    const r = toUserRecord(
      exported({
        clerkUserId: "user_9",
        email: "p@example.com",
        emailVerified: true,
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.record).toMatchObject({
        clerkUserId: "user_9",
        email: "p@example.com",
        emailVerified: true,
      });
    }
  });

  // Reclaim matches on lower(email); storing the address as Clerk gave it keeps
  // it usable for display and for actually sending mail.
  it("preserves email case but trims surrounding whitespace", () => {
    const r = toUserRecord(exported({ email: "  Person@Example.COM  " }));
    expect(r.ok && r.record.email).toBe("Person@Example.COM");
  });

  it("normalises blank names and usernames to null", () => {
    const r = toUserRecord(
      exported({ username: "   ", displayName: "  ", imageUrl: "" }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.record.username).toBeNull();
      expect(r.record.displayName).toBeNull();
      expect(r.record.imageUrl).toBeNull();
    }
  });

  it("trims names and usernames that have content", () => {
    const r = toUserRecord(
      exported({ username: " ada ", displayName: " Ada Lovelace " }),
    );
    expect(r.ok && r.record.username).toBe("ada");
    expect(r.ok && r.record.displayName).toBe("Ada Lovelace");
  });

  it("keeps the image url when present", () => {
    const r = toUserRecord(exported({ imageUrl: "https://img.clerk.com/x" }));
    expect(r.ok && r.record.imageUrl).toBe("https://img.clerk.com/x");
  });

  it("does not carry provider data onto the user row", () => {
    const r = toUserRecord(exported({ providers: ["oauth_google"] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.record).not.toHaveProperty("providers");
      expect(r.record).not.toHaveProperty("externalAccounts");
    }
  });

  it("records an unverified address as unverified", () => {
    const r = toUserRecord(exported({ emailVerified: false }));
    expect(r.ok && r.record.emailVerified).toBe(false);
  });
});

describe("toUserRecord: rejected records", () => {
  // `users.email` is NOT NULL: we deliberately do not model the schema around
  // legacy accounts with no address. Such a record is reported, never inserted.
  it("rejects a record with no email", () => {
    const r = toUserRecord(exported({ email: null, emailVerified: false }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.clerkUserId).toBe("user_1");
      expect(r.problems).toEqual(["email is missing"]);
    }
  });

  it("rejects a whitespace-only email the same as a missing one", () => {
    const r = toUserRecord(exported({ email: "   " }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems).toEqual(["email is missing"]);
  });

  // varchar(320)/varchar(256) ,  silently over-long values would abort the whole
  // backfill transaction, so they are reported rather than truncated.
  it("rejects an email longer than the column allows", () => {
    const r = toUserRecord(
      exported({ email: "a".repeat(320) + "@example.com" }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.problems).toEqual(["email exceeds 320 characters"]);
  });

  it("reports every problem at once rather than only the first", () => {
    const long = "x".repeat(300);
    const r = toUserRecord(
      exported({ email: null, username: long, displayName: long }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.problems).toEqual([
        "email is missing",
        "username exceeds 256 characters",
        "displayName exceeds 256 characters",
      ]);
    }
  });
});

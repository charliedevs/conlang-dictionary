import { describe, expect, it } from "vitest";
import { resolveUser } from "./resolve-user";
import type { ClerkIdentity, UserRow } from "./resolve-user";

const row = (o: Partial<UserRow> = {}): UserRow => ({
  id: "00000000-0000-0000-0000-000000000001",
  clerkUserId: null,
  email: "a@example.com",
  ...o,
});

const identity = (o: Partial<ClerkIdentity> = {}): ClerkIdentity => ({
  clerkUserId: "user_new",
  email: "a@example.com",
  emailVerified: true,
  ...o,
});

describe("resolveUser — already mapped", () => {
  it("returns the existing user when the clerk id is already known", () => {
    const existing = row({ clerkUserId: "user_new" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: existing,
      byEmail: [],
    });
    expect(r).toEqual({ kind: "existing", user: existing });
  });

  // The clerk id is the strongest signal we have. It must win even when the
  // email points somewhere else, or a changed email address would fork the account.
  it("prefers the clerk id match over a different email match", () => {
    const byId = row({ id: "id-by-clerk", clerkUserId: "user_new" });
    const byEmail = row({ id: "id-by-email", clerkUserId: "user_old" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: byId,
      byEmail: [byEmail],
    });
    expect(r).toEqual({ kind: "existing", user: byId });
  });

  it("returns existing even when the email is unverified", () => {
    const existing = row({ clerkUserId: "user_new" });
    const r = resolveUser({
      identity: identity({ emailVerified: false }),
      byClerkId: existing,
      byEmail: [],
    });
    expect(r.kind).toBe("existing");
  });
});

describe("resolveUser — reclaim after cutover", () => {
  it("reclaims a row whose clerk id was never set", () => {
    const orphan = row({ clerkUserId: null });
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [orphan],
    });
    expect(r).toEqual({
      kind: "reclaim",
      user: orphan,
      previousClerkUserId: null,
    });
  });

  // The cutover case: the row still points at the dead development-instance id.
  it("reclaims a row pointing at a stale clerk id and reports the old id for auditing", () => {
    const stale = row({ clerkUserId: "user_old_dev_instance" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [stale],
    });
    expect(r).toEqual({
      kind: "reclaim",
      user: stale,
      previousClerkUserId: "user_old_dev_instance",
    });
  });

  it("matches regardless of email case and surrounding whitespace", () => {
    const stored = row({ email: "Person@Example.COM" });
    const r = resolveUser({
      identity: identity({ email: "  person@example.com  " }),
      byClerkId: null,
      byEmail: [stored],
    });
    expect(r.kind).toBe("reclaim");
  });
});

describe("resolveUser — the account-takeover guard", () => {
  // This is the single most important behaviour in the migration: an unverified
  // address must never grant access to somebody else's conlangs.
  it("never reclaims on an unverified email, even with an exact match", () => {
    const r = resolveUser({
      identity: identity({ emailVerified: false }),
      byClerkId: null,
      byEmail: [row()],
    });
    expect(r.kind).toBe("create");
  });

  it("creates rather than reclaims when the identity has no email", () => {
    const r = resolveUser({
      identity: identity({ email: null, emailVerified: false }),
      byClerkId: null,
      byEmail: [row()],
    });
    expect(r.kind).toBe("create");
  });

  it("reports a conflict rather than guessing when two rows share the email", () => {
    const a = row({ id: "id-a" });
    const b = row({ id: "id-b" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [a, b],
    });
    expect(r.kind).toBe("conflict");
    if (r.kind === "conflict") {
      expect(r.candidateIds).toEqual(["id-a", "id-b"]);
      expect(r.reason).toMatch(/more than one/i);
    }
  });

  // Defends against a caller whose query used the wrong collation or a stale
  // parameter: rows that do not actually match are discarded, not trusted.
  it("ignores supplied rows whose email does not match the identity", () => {
    const wrong = row({ email: "someone-else@example.com" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [wrong],
    });
    expect(r.kind).toBe("create");
  });

  it("reports a conflict only for rows that genuinely match", () => {
    const match = row({ id: "id-match" });
    const noise = row({ id: "id-noise", email: "other@example.com" });
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [match, noise],
    });
    expect(r).toEqual({
      kind: "reclaim",
      user: match,
      previousClerkUserId: null,
    });
  });

  it("treats a row with no stored email as non-matching", () => {
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [row({ email: null })],
    });
    expect(r.kind).toBe("create");
  });
});

describe("resolveUser — new accounts", () => {
  it("creates when nothing matches", () => {
    const r = resolveUser({
      identity: identity(),
      byClerkId: null,
      byEmail: [],
    });
    expect(r.kind).toBe("create");
  });
});

describe("resolveUser — invalid input fails closed", () => {
  it("reports a conflict rather than creating when the clerk id is blank", () => {
    const r = resolveUser({
      identity: identity({ clerkUserId: "  " }),
      byClerkId: null,
      byEmail: [],
    });
    expect(r.kind).toBe("conflict");
  });
});

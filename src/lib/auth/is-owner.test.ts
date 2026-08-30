import { describe, expect, it } from "vitest";
import { isOwner } from "./is-owner";

const owned = { ownerId: "user_clerk", ownerUserId: "uuid-1" };
const user = { id: "uuid-1", clerkUserId: "user_clerk" };

describe("isOwner", () => {
  it("matches on the local user id", () => {
    expect(
      isOwner({ ownerId: "someone_else", ownerUserId: "uuid-1" }, user),
    ).toBe(true);
  });

  // Rows created by the old code between the backfill and the deploy have no
  // ownerUserId yet. Without this fallback they would be invisible to their owner.
  it("falls back to the clerk id when ownerUserId is not yet set", () => {
    expect(isOwner({ ownerId: "user_clerk", ownerUserId: null }, user)).toBe(
      true,
    );
  });

  it("rejects a different owner", () => {
    expect(isOwner({ ownerId: "other", ownerUserId: "uuid-other" }, user)).toBe(
      false,
    );
  });

  it("rejects when there is no user", () => {
    expect(isOwner(owned, null)).toBe(false);
  });

  // A null on both sides must never read as a match.
  it("does not treat a null ownerUserId as matching a user with no clerk id", () => {
    expect(
      isOwner(
        { ownerId: "x", ownerUserId: null },
        { id: "uuid-1", clerkUserId: null },
      ),
    ).toBe(false);
  });

  it("does not match an empty clerk id against an empty ownerId", () => {
    expect(
      isOwner(
        { ownerId: "", ownerUserId: null },
        { id: "uuid-1", clerkUserId: "" },
      ),
    ).toBe(false);
  });

  it("matches the local id even when the user has no clerk id", () => {
    expect(isOwner(owned, { id: "uuid-1", clerkUserId: null })).toBe(true);
  });
});

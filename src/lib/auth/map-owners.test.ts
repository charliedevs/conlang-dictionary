import { describe, expect, it } from "vitest";
import { mapOwnersToConlangs } from "./map-owners";

const userRow = (o = {}) => ({
  id: "uuid-1",
  clerkUserId: "user_clerk",
  displayName: "Ada Lovelace",
  username: null,
  imageUrl: "https://img/1",
  ...o,
});

describe("mapOwnersToConlangs", () => {
  it("matches a conlang to its owner by local user id", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "other", ownerUserId: "uuid-1" }],
      [userRow()],
    );
    expect(map[1]).toEqual({ name: "Ada Lovelace", imageUrl: "https://img/1" });
  });

  // Rows written before the backfill have no ownerUserId yet.
  it("falls back to the legacy clerk id", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "user_clerk", ownerUserId: null }],
      [userRow()],
    );
    expect(map[1]?.name).toBe("Ada Lovelace");
  });

  it("prefers displayName but falls back to username", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "user_clerk", ownerUserId: null }],
      [userRow({ displayName: null, username: "ada" })],
    );
    expect(map[1]?.name).toBe("ada");
  });

  it("yields a null name when the owner has neither", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "user_clerk", ownerUserId: null }],
      [userRow({ displayName: null, username: null })],
    );
    expect(map[1]?.name).toBeNull();
  });

  it("omits conlangs whose owner is not in the list", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "nobody", ownerUserId: null }],
      [userRow()],
    );
    expect(map[1]).toBeUndefined();
  });

  it("never exposes the owner's email or ids", () => {
    const map = mapOwnersToConlangs(
      [{ id: 1, ownerId: "user_clerk", ownerUserId: null }],
      [userRow()],
    );
    expect(Object.keys(map[1]!)).toEqual(["name", "imageUrl"]);
  });

  it("handles an empty input", () => {
    expect(mapOwnersToConlangs([], [])).toEqual({});
  });
});

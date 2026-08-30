import { describe, expect, it } from "vitest";
import { classifyOwners } from "./classify-owners";
import type { OwnerRow, SnapshotIdentity } from "./classify-owners";

const owner = (ownerId: string, conlangCount = 1): OwnerRow => ({
  ownerId,
  conlangCount,
});
const identity = (o: Partial<SnapshotIdentity> = {}): SnapshotIdentity => ({
  email: "a@example.com",
  emailVerified: true,
  ...o,
});

describe("classifyOwners — reclaimable owners", () => {
  it("classifies an owner with a verified email as reclaimable", () => {
    const r = classifyOwners({
      owners: [owner("user_a")],
      snapshot: new Map([["user_a", identity()]]),
    });
    expect(r.reclaimable.map((o) => o.ownerId)).toEqual(["user_a"]);
    expect(r.blockingCount).toBe(0);
    expect(r.pass).toBe(true);
  });
});

describe("classifyOwners — blocking cases", () => {
  it("blocks an owner present in the snapshot with no email", () => {
    const r = classifyOwners({
      owners: [owner("user_a")],
      snapshot: new Map([
        ["user_a", identity({ email: null, emailVerified: false })],
      ]),
    });
    expect(r.noEmail.map((o) => o.ownerId)).toEqual(["user_a"]);
    expect(r.blockingCount).toBe(1);
    expect(r.pass).toBe(false);
  });

  it("blocks an owner missing from the snapshot but still live in Clerk", () => {
    const r = classifyOwners({
      owners: [owner("user_a")],
      snapshot: new Map(),
      existsInClerk: new Map([["user_a", true]]),
    });
    expect(r.missingButLive.map((o) => o.ownerId)).toEqual(["user_a"]);
    expect(r.blockingCount).toBe(1);
    expect(r.pass).toBe(false);
  });

  it("counts an unverified email as a warning, not a blocker", () => {
    const r = classifyOwners({
      owners: [owner("user_a")],
      snapshot: new Map([["user_a", identity({ emailVerified: false })]]),
    });
    expect(r.unverified.map((o) => o.ownerId)).toEqual(["user_a"]);
    expect(r.blockingCount).toBe(0);
  });
});

describe("classifyOwners — pre-existing orphans", () => {
  // An account deleted from Clerk is already unreachable today. Counting it as
  // a migration blocker would make a clean cutover look unsafe forever.
  it("treats an owner deleted from Clerk as a pre-existing orphan, not a blocker", () => {
    const r = classifyOwners({
      owners: [owner("user_gone", 3)],
      snapshot: new Map(),
      existsInClerk: new Map([["user_gone", false]]),
    });
    expect(r.deletedFromClerk.map((o) => o.ownerId)).toEqual(["user_gone"]);
    expect(r.preExistingOrphanCount).toBe(1);
    expect(r.blockingCount).toBe(0);
    expect(r.pass).toBe(true);
  });

  // Without a Clerk lookup we cannot tell a deleted account from a live one we
  // failed to capture. Guessing "deleted" would hide a real blocker, so an
  // unclassified owner must be treated as unsafe.
  it("treats an unclassified missing owner as blocking when Clerk was not consulted", () => {
    const r = classifyOwners({
      owners: [owner("user_x")],
      snapshot: new Map(),
    });
    expect(r.unclassified.map((o) => o.ownerId)).toEqual(["user_x"]);
    expect(r.blockingCount).toBe(1);
    expect(r.pass).toBe(false);
  });

  it("treats a missing owner as unclassified when Clerk has no answer for it", () => {
    const r = classifyOwners({
      owners: [owner("user_x"), owner("user_y")],
      snapshot: new Map(),
      existsInClerk: new Map([["user_y", false]]),
    });
    expect(r.unclassified.map((o) => o.ownerId)).toEqual(["user_x"]);
    expect(r.deletedFromClerk.map((o) => o.ownerId)).toEqual(["user_y"]);
    expect(r.blockingCount).toBe(1);
  });
});

describe("classifyOwners — totals", () => {
  it("puts every owner in exactly one bucket", () => {
    const owners = [owner("a"), owner("b"), owner("c"), owner("d"), owner("e")];
    const r = classifyOwners({
      owners,
      snapshot: new Map([
        ["a", identity()],
        ["b", identity({ emailVerified: false })],
        ["c", identity({ email: null, emailVerified: false })],
      ]),
      existsInClerk: new Map([
        ["d", false],
        ["e", true],
      ]),
    });
    const total =
      r.reclaimable.length +
      r.unverified.length +
      r.noEmail.length +
      r.deletedFromClerk.length +
      r.missingButLive.length +
      r.unclassified.length;
    expect(total).toBe(owners.length);
    expect(r.blockingCount).toBe(2); // c (no email) + e (live but missing)
    expect(r.preExistingOrphanCount).toBe(1); // d
    expect(r.pass).toBe(false);
  });

  it("sums conlangs at risk across blocking owners only", () => {
    const r = classifyOwners({
      owners: [owner("a", 5), owner("b", 7)],
      snapshot: new Map([
        ["a", identity({ email: null, emailVerified: false })],
      ]),
      existsInClerk: new Map([["b", false]]),
    });
    expect(r.conlangsBlocked).toBe(5);
    expect(r.conlangsPreExistingOrphaned).toBe(7);
  });

  it("passes on an empty owner set", () => {
    const r = classifyOwners({ owners: [], snapshot: new Map() });
    expect(r.pass).toBe(true);
    expect(r.blockingCount).toBe(0);
  });
});

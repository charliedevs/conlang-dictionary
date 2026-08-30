import { describe, expect, it } from "vitest";
import { planOwnershipBackfill } from "./plan-ownership-backfill";

describe("planOwnershipBackfill", () => {
  it("maps each clerk id to its local user id", () => {
    const plan = planOwnershipBackfill({
      distinctOwnerIds: ["user_a", "user_b"],
      userIdByClerkId: new Map([
        ["user_a", "uuid-a"],
        ["user_b", "uuid-b"],
      ]),
    });
    expect(plan.mapped).toEqual([
      { clerkUserId: "user_a", userId: "uuid-a" },
      { clerkUserId: "user_b", userId: "uuid-b" },
    ]);
    expect(plan.unmapped).toEqual([]);
  });

  // An unmapped owner is the whole reason this plan exists: it means a conlang
  // would be left with no local owner, so it must be surfaced, never skipped.
  it("reports owners with no local user rather than dropping them", () => {
    const plan = planOwnershipBackfill({
      distinctOwnerIds: ["user_a", "user_gone"],
      userIdByClerkId: new Map([["user_a", "uuid-a"]]),
    });
    expect(plan.mapped).toEqual([{ clerkUserId: "user_a", userId: "uuid-a" }]);
    expect(plan.unmapped).toEqual(["user_gone"]);
  });

  it("accounts for every input id exactly once", () => {
    const ids = ["a", "b", "c", "d"];
    const plan = planOwnershipBackfill({
      distinctOwnerIds: ids,
      userIdByClerkId: new Map([
        ["a", "ua"],
        ["c", "uc"],
      ]),
    });
    expect(plan.mapped.length + plan.unmapped.length).toBe(ids.length);
  });

  it("ignores blank and duplicate owner ids", () => {
    const plan = planOwnershipBackfill({
      distinctOwnerIds: ["user_a", "user_a", "  ", ""],
      userIdByClerkId: new Map([["user_a", "uuid-a"]]),
    });
    expect(plan.mapped).toEqual([{ clerkUserId: "user_a", userId: "uuid-a" }]);
    expect(plan.unmapped).toEqual([]);
  });

  it("handles an empty input", () => {
    const plan = planOwnershipBackfill({
      distinctOwnerIds: [],
      userIdByClerkId: new Map(),
    });
    expect(plan).toEqual({ mapped: [], unmapped: [] });
  });

  it("does not invent a mapping for an id whose user id is blank", () => {
    const plan = planOwnershipBackfill({
      distinctOwnerIds: ["user_a"],
      userIdByClerkId: new Map([["user_a", "  "]]),
    });
    expect(plan.mapped).toEqual([]);
    expect(plan.unmapped).toEqual(["user_a"]);
  });
});

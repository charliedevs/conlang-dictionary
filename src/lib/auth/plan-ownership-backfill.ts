// Splits conlang owners into those with a local user row and those without.
// A non-empty `unmapped` for conlangs blocks the cutover.

export interface OwnershipBackfillPlan {
  mapped: { clerkUserId: string; userId: string }[];
  unmapped: string[];
}

export function planOwnershipBackfill(input: {
  distinctOwnerIds: string[];
  userIdByClerkId: Map<string, string>;
}): OwnershipBackfillPlan {
  const mapped: { clerkUserId: string; userId: string }[] = [];
  const unmapped: string[] = [];
  const seen = new Set<string>();

  for (const raw of input.distinctOwnerIds) {
    const clerkUserId = raw.trim();
    if (clerkUserId === "" || seen.has(clerkUserId)) continue;
    seen.add(clerkUserId);

    const userId = input.userIdByClerkId.get(clerkUserId)?.trim();
    if (userId === undefined || userId === "") unmapped.push(clerkUserId);
    else mapped.push({ clerkUserId, userId });
  }

  return { mapped, unmapped };
}

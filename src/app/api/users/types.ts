import { z } from "zod";

/**
 * Lookup is by Clerk user id only.
 *
 * Filtering by `username` or `emailAddress` was previously accepted and never
 * used by any caller — it turned this unauthenticated route into an account
 * enumeration oracle: anyone could probe an address and learn whether it had an
 * account, along with that person's real name and avatar. Ids are opaque and
 * already present in public page data, so resolving them is not equivalent.
 *
 * This route is removed entirely once owner attribution moves to the local
 * users table (see tasks/plan.md, Task 2.5).
 */
export const MAX_USER_IDS = 100;

export const getUsersSchema = z.object({
  // An empty list is valid and resolves to no users — a signed-in account with
  // no conlangs legitimately asks for zero owners. It must never reach Clerk
  // unfiltered, which would return an arbitrary page of the whole user base.
  userId: z.array(z.string().min(1)).max(MAX_USER_IDS),
});

export type User = {
  id: string;
  name: string | null;
  imageUrl: string;
};

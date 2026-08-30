import { z } from "zod";

// Lookup is by user id only. Filtering by username or emailAddress was never
// used by any caller and made this unauthenticated route an account
// enumeration oracle.
export const MAX_USER_IDS = 100;

export const getUsersSchema = z.object({
  // Empty is valid: an account with no conlangs asks for zero owners.
  userId: z.array(z.string().min(1)).max(MAX_USER_IDS),
});

export type User = {
  id: string;
  name: string | null;
  imageUrl: string;
};

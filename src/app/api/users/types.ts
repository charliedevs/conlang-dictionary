import { z } from "zod";

export const getUsersSchema = z.object({
  userId: z.array(z.string()).optional(),
  username: z.array(z.string()).optional(),
  emailAddress: z.array(z.string()).optional(),
});

export type User = {
  id: string;
  name: string;
  imageUrl: string;
};

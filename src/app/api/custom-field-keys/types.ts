import { z } from "zod";

export const getCustomFieldKeysSchema = z.object({
  conlangId: z.number(),
});

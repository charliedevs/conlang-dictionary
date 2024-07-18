import { z } from "zod";

export const getLexicalCategoriesSchema = z.object({
  conlangId: z.number(),
});

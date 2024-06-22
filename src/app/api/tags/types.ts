import { z } from "zod";
import { tagType } from "~/server/db/schema";

export const getTagsSchema = z.object({
  tagType: z.enum(tagType.enumValues).optional(),
  isForUser: z.boolean().optional(),
});

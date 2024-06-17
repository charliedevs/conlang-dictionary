import { z } from "zod";
import { tagTypes } from "~/types/tag";

export const getTagsSchema = z.object({
  tagType: z.enum(tagTypes).optional(),
  isForUser: z.boolean().optional(),
});

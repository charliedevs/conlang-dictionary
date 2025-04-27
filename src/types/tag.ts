import { type tagColor, type tagType } from "~/server/db/schema";
import { type getAllWordTags } from "~/server/queries";

type Tags = Awaited<ReturnType<typeof getAllWordTags>>;
export type Tag = Tags[number];
export type TagType = (typeof tagType.enumValues)[number];
export type TagColor = (typeof tagColor.enumValues)[number];

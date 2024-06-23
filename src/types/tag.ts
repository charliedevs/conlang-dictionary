import { type tagColor, type tagType } from "~/server/db/schema";

export type TagType = (typeof tagType.enumValues)[number];

export type TagColor = (typeof tagColor.enumValues)[number];

export type Tag = {
  id: number;
  text: string;
  type: TagType;
  color?: TagColor | null;
};

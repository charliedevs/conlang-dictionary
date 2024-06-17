export const tagTypes = ["word", "conlang"] as const;
export type TagType = (typeof tagTypes)[number];

export type Tag = {
  id: number;
  text: string;
  type: TagType;
};

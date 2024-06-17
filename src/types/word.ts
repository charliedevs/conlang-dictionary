import { type Tag } from "./tag";

export type Word = {
  id: number;
  conlangId: number;
  text: string;
  pronunciation: string | null;
  gloss: string | null;
  definition: string | null;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date | null;
};

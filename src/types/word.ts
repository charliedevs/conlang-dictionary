import { type sectionType } from "~/server/db/schema";
import { type Tag } from "./tag";

export type Word = {
  id: number;
  conlangId: number;
  text: string;
  pronunciation: string | null;
  gloss: string | null;
  definition: string | null;
  tags: Tag[];
  sections: Section[];
  createdAt: Date;
  updatedAt: Date | null;
};

export type SectionType = (typeof sectionType.enumValues)[number];
export type Section = {
  id: number;
  wordId: number;
  order: number;
  type: SectionType;
  lexicalCategory?: LexicalCategory | null;
  definitions?: Definition[] | null;
  customTitle?: string | null;
  customText?: string | null;
};

export type LexicalCategory = {
  id: number;
  category: string;
};

export type Definition = {
  id: number;
  order: number;
  text: string;
};

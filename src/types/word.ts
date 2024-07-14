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

export type Section = {
  id: number;
  wordId: number;
  definition?: Definition | null;
  customTitle?: string | null;
  customText?: string | null;
};

export type Definition = {
  id: number;
  lexicalCategory: LexicalCategory;
  text: string;
};

export type LexicalCategory = {
  id: number;
  category: string;
};

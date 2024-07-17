import { type sectionType } from "~/server/db/schema";
import {
  type getDefinitionsBySectionId,
  type getLexicalCategoriesForConlang,
  type getSectionsByWordId,
  type getWordsByConlangId,
} from "~/server/queries";

type Words = Awaited<ReturnType<typeof getWordsByConlangId>>;
export type Word = Words[number];

type Sections = Awaited<ReturnType<typeof getSectionsByWordId>>;
export type Section = Sections[number];
export type SectionType = (typeof sectionType.enumValues)[number];

type LexicalCategories = Awaited<
  ReturnType<typeof getLexicalCategoriesForConlang>
>;
export type LexicalCategory = LexicalCategories[number];

type Definitions = Awaited<ReturnType<typeof getDefinitionsBySectionId>>;
export type Definition = Definitions[number];

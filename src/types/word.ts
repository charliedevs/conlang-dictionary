import { type sectionType } from "~/server/db/schema";
import {
  type getDefinitionSections,
  type getDefinitions,
  type getLexicalCategoriesForConlang,
  type getWordSections,
  type getWordsByConlangId,
} from "~/server/queries";

type Words = Awaited<ReturnType<typeof getWordsByConlangId>>;
export type Word = Words[number];

type WordSections = Awaited<ReturnType<typeof getWordSections>>;
export type WordSection = WordSections[number];
export type SectionType = (typeof sectionType.enumValues)[number];

type LexicalCategories = Awaited<
  ReturnType<typeof getLexicalCategoriesForConlang>
>;
export type LexicalCategory = LexicalCategories[number];

type DefinitionSections = Awaited<ReturnType<typeof getDefinitionSections>>;
export type DefinitionSection = DefinitionSections[number];

type Definitions = Awaited<ReturnType<typeof getDefinitions>>;
export type Definition = Definitions[number];

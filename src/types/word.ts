import { type lexicalSections, type sectionType } from "~/server/db/schema";
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

type LexicalCategories = Awaited<
  ReturnType<typeof getLexicalCategoriesForConlang>
>;
export type LexicalCategory = LexicalCategories[number];

type DefinitionSections = Awaited<ReturnType<typeof getDefinitionSections>>;
export type DefinitionSection = DefinitionSections[number];

type Definitions = Awaited<ReturnType<typeof getDefinitions>>;
export type Definition = Definitions[number];

// --- LexicalSection type-safe properties ---
export type DefinitionSectionProperties = {
  title?: string;
  lexicalCategoryId: number;
  definitionText?: string;
  examples?: string[];
};

export type PronunciationSectionProperties = {
  title?: string;
  ipa?: string;
  audioUrl?: string;
  region?: string;
  phonemeIds?: string[];
};

export type EtymologySectionProperties = {
  title?: string;
  etymologyText?: string;
};

export type CustomTextSectionProperties = {
  title?: string;
  contentText?: string;
};

export type CustomFieldsSectionProperties = {
  title?: string;
  customFields: Record<string, unknown>;
};

export type LexicalSectionDb = typeof lexicalSections.$inferSelect;
export type SectionType = (typeof sectionType.enumValues)[number];

export type LexicalSection = Omit<
  LexicalSectionDb,
  "properties" | "sectionType" | "createdAt" | "updatedAt"
> &
  (
    | { sectionType: "definition"; properties: DefinitionSectionProperties }
    | {
        sectionType: "pronunciation";
        properties: PronunciationSectionProperties;
      }
    | { sectionType: "etymology"; properties: EtymologySectionProperties }
    | { sectionType: "custom_text"; properties: CustomTextSectionProperties }
    | {
        sectionType: "custom_fields";
        properties: CustomFieldsSectionProperties;
      }
  );
// --- End LexicalSection type-safe properties ---

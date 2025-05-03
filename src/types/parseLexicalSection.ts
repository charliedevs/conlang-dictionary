import {
  type CustomFieldsSectionProperties,
  type CustomTextSectionProperties,
  type DefinitionSectionProperties,
  type EtymologySectionProperties,
  type LexicalSection,
  type LexicalSectionDb,
  type PronunciationSectionProperties,
} from "./word";

/**
 * Parses a raw lexicalSection object (e.g., from the DB) into a type-safe LexicalSection.
 * Throws if sectionType is unknown.
 */
export function parseLexicalSection(section: LexicalSectionDb): LexicalSection {
  switch (section.sectionType) {
    case "definition":
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "definition",
        properties: section.properties as DefinitionSectionProperties,
      };
    case "pronunciation":
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "pronunciation",
        properties: section.properties as PronunciationSectionProperties,
      };
    case "etymology":
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "etymology",
        properties: section.properties as EtymologySectionProperties,
      };
    case "custom_text":
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "custom_text",
        properties: section.properties as CustomTextSectionProperties,
      };
    case "custom_fields":
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "custom_fields",
        properties: section.properties as CustomFieldsSectionProperties,
      };
    default:
      throw new Error("Unknown sectionType");
  }
}

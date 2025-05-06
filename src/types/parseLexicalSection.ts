import { markdownToHtml } from "~/lib/strings";
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
    case "definition": {
      const props = section.properties as DefinitionSectionProperties;
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "definition",
        properties: {
          ...props,
          definitionText: props.definitionText
            ? markdownToHtml(props.definitionText)
            : "",
        },
      };
    }
    case "pronunciation": {
      const props = section.properties as PronunciationSectionProperties;
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "pronunciation",
        properties: {
          ...props,
          pronunciationText: props.pronunciationText
            ? markdownToHtml(props.pronunciationText)
            : "",
        },
      };
    }
    case "etymology": {
      const props = section.properties as EtymologySectionProperties;
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "etymology",
        properties: {
          ...props,
          etymologyText: props.etymologyText
            ? markdownToHtml(props.etymologyText)
            : "",
        },
      };
    }
    case "custom_text": {
      const props = section.properties as CustomTextSectionProperties;
      return {
        id: section.id,
        wordId: section.wordId,
        order: section.order,
        sectionType: "custom_text",
        properties: {
          ...props,
          contentText: props.contentText
            ? markdownToHtml(props.contentText)
            : "",
        },
      };
    }
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

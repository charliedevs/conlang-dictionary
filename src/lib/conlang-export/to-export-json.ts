import {
  EXPORT_FORMAT_VERSION,
  type ConlangExport,
  type LexicalSectionExport,
} from "~/types/conlang-export";
import { type TagColor } from "~/types/tag";
import {
  type CustomFieldsSectionProperties,
  type CustomTextSectionProperties,
  type DefinitionSectionProperties,
  type EtymologySectionProperties,
  type PronunciationSectionProperties,
  type SectionType,
} from "~/types/word";

/**
 * Minimal structural input contract for `serializeConlangExport` — decoupled
 * from the exact drizzle-inferred return type of `getConlangExportData` so
 * the serializer stays a pure, easily testable function. The real query
 * result satisfies this shape structurally (it has these fields plus more).
 */
export interface ConlangExportSourceData {
  conlang: {
    name: string;
    description?: string | null;
    emoji?: string | null;
  };
  lexicalCategories: Array<{ id: number; category: string }>;
  words: Array<{
    text: string;
    tags: Array<{ text: string; color: TagColor | null }>;
    lexicalSections: Array<{
      sectionType: SectionType;
      order: number;
      properties: unknown;
    }>;
  }>;
}

function serializeSection(
  section: ConlangExportSourceData["words"][number]["lexicalSections"][number],
  categoryIdToLocalId: Map<number, number>,
): LexicalSectionExport {
  switch (section.sectionType) {
    case "definition": {
      const properties = section.properties as DefinitionSectionProperties;
      const localCategoryId = categoryIdToLocalId.get(
        properties.lexicalCategoryId,
      );
      if (localCategoryId === undefined) {
        throw new Error(
          `Definition section references unknown lexical category ${properties.lexicalCategoryId}`,
        );
      }
      return {
        sectionType: "definition",
        order: section.order,
        properties: {
          title: properties.title,
          lexicalCategoryId: localCategoryId,
          definitionText: properties.definitionText,
          examples: properties.examples,
        },
      };
    }
    case "pronunciation":
      return {
        sectionType: "pronunciation",
        order: section.order,
        properties: section.properties as PronunciationSectionProperties,
      };
    case "etymology":
      return {
        sectionType: "etymology",
        order: section.order,
        properties: section.properties as EtymologySectionProperties,
      };
    case "custom_text":
      return {
        sectionType: "custom_text",
        order: section.order,
        properties: section.properties as CustomTextSectionProperties,
      };
    case "custom_fields":
      return {
        sectionType: "custom_fields",
        order: section.order,
        properties: section.properties as CustomFieldsSectionProperties,
      };
  }
}

export function serializeConlangExport(
  data: ConlangExportSourceData,
): ConlangExport {
  const categoryIdToLocalId = new Map<number, number>();
  const lexicalCategories = data.lexicalCategories.map((category, index) => {
    const localId = index + 1;
    categoryIdToLocalId.set(category.id, localId);
    return { localId, category: category.category };
  });

  const words = data.words.map((word) => ({
    text: word.text,
    tags: word.tags.map((tag) => ({ text: tag.text, color: tag.color })),
    lexicalSections: word.lexicalSections.map((section) =>
      serializeSection(section, categoryIdToLocalId),
    ),
  }));

  return {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    conlang: {
      name: data.conlang.name,
      description: data.conlang.description ?? undefined,
      emoji: data.conlang.emoji ?? undefined,
    },
    lexicalCategories,
    words,
  };
}

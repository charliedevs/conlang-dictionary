"use server";

import { insertDefinition, insertSection } from "~/server/queries";

interface SectionInsert {
  wordId: number;
  definitionId?: number;
  lexicalCategoryId?: number;
  definitionText?: string;
  customTitle?: string;
  customText?: string;
}
export async function createSection(section: SectionInsert) {
  if (section.lexicalCategoryId && section.definitionText) {
    const definition = await insertDefinition({
      lexicalCategoryId: section.lexicalCategoryId,
      text: section.definitionText,
    });
    section.definitionId = definition.id;
  }
  await insertSection(section);
}

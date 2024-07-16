"use server";

import {
  getDefinitionsBySectionId,
  getSectionsByWordId,
  insertDefinition,
  insertSection,
} from "~/server/queries";
import { type SectionType } from "~/types/word";

export interface CreateSection {
  wordId: number;
  order?: number;
  type: SectionType;
  lexicalCategoryId?: number;
  customTitle?: string;
  customText?: string;
}
export async function createSection(section: CreateSection) {
  const sections = await getSectionsByWordId(section.wordId);
  const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), 0);
  section.order = maxOrder + 1;
  await insertSection(section as CreateSection & { order: number });
}

interface DefinitionInsert {
  sectionId: number;
  order?: number;
  text: string;
}
export async function createDefinition(definition: DefinitionInsert) {
  const definitions = await getDefinitionsBySectionId(definition.sectionId);
  const maxOrder = definitions.reduce((max, d) => Math.max(max, d.order), 0);
  definition.order = maxOrder + 1;
  await insertDefinition(definition as DefinitionInsert & { order: number });
}

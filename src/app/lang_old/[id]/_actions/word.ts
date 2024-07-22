"use server";

import {
  deleteDefinition,
  deleteSection,
  getDefinitionsBySectionId,
  getLexicalCategoriesForConlang,
  getSectionsByWordId,
  insertWord as insert,
  insertDefinition,
  insertLexicalCategory,
  insertSection,
  updateWord as update,
  updateDefinition,
  type DefinitionDelete,
  type DefinitionUpdate,
  type SectionDelete,
  type WordInsert,
  type WordUpdate,
} from "~/server/queries";
import { type SectionType } from "~/types/word";

export async function createWord(word: WordInsert) {
  await insert(word);
}

export async function updateWord(word: WordUpdate) {
  await update(word);
}

export interface CreateLexicalCategory {
  conlangId: number;
  category: string;
}
export async function createLexicalCategory(lc: CreateLexicalCategory) {
  const existingCategories = await getLexicalCategoriesForConlang(lc.conlangId);
  const existingCategoryNames = existingCategories.map((c) =>
    c.category.toLocaleLowerCase(),
  );
  lc.category = lc.category.trim().toLocaleLowerCase();
  if (existingCategoryNames.includes(lc.category)) {
    throw new Error("Part of speech already exists");
  }
  try {
    await insertLexicalCategory(lc);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding part of speech.");
  }
}

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

export async function removeSection(section: SectionDelete) {
  await deleteSection(section);
}

interface CreateDefinition {
  sectionId: number;
  order?: number;
  text: string;
}
export async function createDefinition(definition: CreateDefinition) {
  const definitions = await getDefinitionsBySectionId(definition.sectionId);
  const maxOrder = definitions.reduce((max, d) => Math.max(max, d.order), 0);
  definition.order = maxOrder + 1;
  await insertDefinition(definition as CreateDefinition & { order: number });
}

export async function editDefinition(definition: DefinitionUpdate) {
  await updateDefinition(definition);
}

export async function removeDefinition(definition: DefinitionDelete) {
  await deleteDefinition(definition);
}

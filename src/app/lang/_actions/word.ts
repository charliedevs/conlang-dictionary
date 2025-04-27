"use server";

import {
  deleteDefinition,
  deleteWord,
  deleteWordSection,
  insertCustomSection,
  insertDefinition,
  insertDefinitionSection,
  insertWord,
  insertWordSection,
  updateDefinition,
  updateWord,
  updateWordSectionOrders,
  type DefinitionInsert,
  type DefinitionUpdate,
  type WordInsert,
  type WordUpdate,
} from "~/server/queries";

export async function createWord(word: WordInsert) {
  const newWord = await insertWord(word);
  return newWord;
}

export async function editWord(word: WordUpdate) {
  await updateWord(word);
}

export async function removeWord(wordId: number) {
  await deleteWord(wordId);
}

// Sections
export interface CustomSectionCreate {
  wordId: number;
  title: string;
  text: string;
}
export async function createCustomSection(cs: CustomSectionCreate) {
  const newWordSection = await insertWordSection({
    wordId: cs.wordId,
    title: cs.title,
  });
  const newCustomSection = await insertCustomSection({
    wordSectionId: newWordSection.id,
    text: cs.text,
  });
  return newCustomSection;
}

export interface DefinitionSectionCreate {
  wordId: number;
  title: string;
  lexicalCategoryId: number;
  text: string;
}
export async function createDefinitionSection(ds: DefinitionSectionCreate) {
  const newWordSection = await insertWordSection({
    wordId: ds.wordId,
    title: ds.title,
  });
  const newDefinitionSection = await insertDefinitionSection({
    wordSectionId: newWordSection.id,
    lexicalCategoryId: ds.lexicalCategoryId,
  });
  const newDefinition = await insertDefinition({
    definitionSectionId: newDefinitionSection.id,
    text: ds.text,
  });
  return newDefinition;
}

export interface SectionOrderUpdate {
  id: number;
  order: number;
}

export async function updateSectionOrders(updates: SectionOrderUpdate[]) {
  const results = await updateWordSectionOrders(updates);
  return results;
}

export async function removeWordSection(sectionId: number) {
  await deleteWordSection(sectionId);
}

export async function addDefinition(d: DefinitionInsert) {
  const newDefinition = await insertDefinition(d);
  return newDefinition;
}

export async function editDefinition(d: DefinitionUpdate) {
  const definition = await updateDefinition(d);
  return definition;
}

export async function removeDefinition(definitionId: number) {
  await deleteDefinition(definitionId);
}

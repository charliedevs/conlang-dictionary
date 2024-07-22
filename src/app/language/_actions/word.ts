"use server";

import {
  deleteWord,
  insertDefinition,
  insertDefinitionSection,
  insertWord,
  insertWordSection,
  updateWord,
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

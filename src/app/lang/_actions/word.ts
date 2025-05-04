"use server";

import {
  deleteLexicalSection,
  insertLexicalSection,
  updateLexicalSectionOrders,
  updateLexicalSectionProperties,
  type InsertLexicalSectionInput,
  type LexicalSectionOrderUpdate,
  type UpdateLexicalSectionPropertiesInput,
} from "~/server/mutations";
import {
  deleteWord,
  insertWord,
  updateWord,
  type WordInsert,
  type WordUpdate,
} from "~/server/queries";

// #region Word Actions
export async function createWord(word: WordInsert) {
  return await insertWord(word);
}

export async function editWord(word: WordUpdate) {
  return await updateWord(word);
}

export async function removeWord(wordId: number) {
  return await deleteWord(wordId);
}
// #endregion Word Actions

// #region Lexical Section Actions
export async function createLexicalSection(input: InsertLexicalSectionInput) {
  return await insertLexicalSection(input);
}

export async function editLexicalSectionProperties(
  sectionId: string,
  input: UpdateLexicalSectionPropertiesInput,
) {
  return await updateLexicalSectionProperties(sectionId, input);
}

export async function updateSectionOrders(
  updates: LexicalSectionOrderUpdate[],
) {
  return await updateLexicalSectionOrders(updates);
}

export async function removeLexicalSection(sectionId: string) {
  return await deleteLexicalSection(sectionId);
}
// #endregion Lexical Section Actions

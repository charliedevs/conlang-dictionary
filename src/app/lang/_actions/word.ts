"use server";

import {
  updateLexicalSectionOrders,
  type LexicalSectionOrderUpdate,
} from "~/server/mutations";
import {
  deleteWord,
  insertWord,
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

export async function updateSectionOrders(
  updates: LexicalSectionOrderUpdate[],
) {
  const results = await updateLexicalSectionOrders(updates);
  return results;
}

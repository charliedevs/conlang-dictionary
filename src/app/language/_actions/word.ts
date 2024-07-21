"use server";

import { insertWord, type WordInsert } from "~/server/queries";

export async function createWord(word: WordInsert) {
  const newWord = await insertWord(word);
  return newWord;
}

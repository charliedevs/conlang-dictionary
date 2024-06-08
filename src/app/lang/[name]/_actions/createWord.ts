"use server";

import { insertWord, type WordInsert } from "~/server/queries";

export async function createWord(word: WordInsert) {
  await insertWord(word);
}

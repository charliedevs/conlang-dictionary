"use server";

import {
  insertWord as insert,
  updateWord as update,
  type WordInsert,
  type WordUpdate,
} from "~/server/queries";

export async function createWord(word: WordInsert) {
  await insert(word);
}

export async function updateWord(word: WordUpdate) {
  await update(word);
}

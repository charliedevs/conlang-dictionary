"use server";

import { insertLexicalCategory } from "../mutations";
import { getLexicalCategoriesForConlang } from "../queries";

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

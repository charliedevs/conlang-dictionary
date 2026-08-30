"use server";

import { isOwner } from "~/lib/auth/is-owner";
import { normalizeCategoryName } from "~/lib/lexical-categories/defaults";
import { requireCurrentUser } from "../auth/current-user";
import { insertLexicalCategory } from "../mutations";
import { getConlangById, getLexicalCategoriesForConlang } from "../queries";

export interface CreateLexicalCategory {
  conlangId: number;
  category: string;
}

/** Throws unless the signed-in user owns the target conlang. */
async function assertConlangOwner(conlangId: number) {
  const user = await requireCurrentUser();
  const conlang = await getConlangById(conlangId, { skipAuth: true });
  if (!isOwner(conlang, user)) throw new Error("Unauthorized");
}

export async function createLexicalCategory(lc: CreateLexicalCategory) {
  await assertConlangOwner(lc.conlangId);

  const name = normalizeCategoryName(lc.category);
  if (!name) throw new Error("Part of speech can't be empty");

  const existing = await getLexicalCategoriesForConlang(lc.conlangId);
  if (existing.some((c) => normalizeCategoryName(c.category) === name)) {
    throw new Error("Part of speech already exists");
  }

  try {
    const inserted = await insertLexicalCategory({
      conlangId: lc.conlangId,
      category: name,
    });
    return { id: inserted.id, category: inserted.category };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding part of speech.");
  }
}

/**
 * Insert several categories at once, skipping any that already exist or repeat
 * (case-insensitively). Backs the "Add all" suggestion; returns what was
 * actually created.
 */
export async function createLexicalCategories(
  conlangId: number,
  categories: string[],
) {
  await assertConlangOwner(conlangId);

  const existing = await getLexicalCategoriesForConlang(conlangId);
  const have = new Set(existing.map((c) => normalizeCategoryName(c.category)));

  const created: { id: number; category: string }[] = [];
  for (const raw of categories) {
    const name = normalizeCategoryName(raw);
    if (!name || have.has(name)) continue;
    have.add(name);
    const inserted = await insertLexicalCategory({ conlangId, category: name });
    created.push({ id: inserted.id, category: inserted.category });
  }
  return created;
}

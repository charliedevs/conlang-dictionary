import "server-only";

import { auth } from "@clerk/nextjs/server";

import { and, eq } from "drizzle-orm";
import { type TagType } from "~/types/tag";
import analyticsServerClient from "./analytics";
import { db } from "./db";
import { conlangs, tags, words, wordsToTags } from "./db/schema";

// #region CONLANGS
export async function getMyConlangs() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const conlangs = await db.query.conlangs.findMany({
    where: (model, { eq }) => eq(model.ownerId, userId),
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return conlangs;
}

export async function getConlangById(id: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const conlang = await db.query.conlangs.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!conlang) throw new Error("Conlang not found");

  if (conlang.ownerId !== userId) throw new Error("Unauthorized");

  return conlang;
}

export async function getConlangByName(name: string) {
  const conlang = await db.query.conlangs.findFirst({
    where: (model, { eq }) => eq(model.name, name),
  });
  if (!conlang) throw new Error("Conlang not found");
  return conlang;
}

export async function getRecentConlangs() {
  const conlangs = await db.query.conlangs.findMany({
    where: (model, { eq }) => eq(model.isPublic, true),
    orderBy: (model, { desc }) => desc(model.createdAt),
    limit: 5,
  });

  return conlangs;
}

export async function createConlang(
  name: string,
  description?: string,
  emoji?: string,
  isPublic = false,
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const conlang = await db
    .insert(conlangs)
    .values({
      name,
      description,
      emoji,
      isPublic,
      ownerId: userId,
    })
    .returning();

  if (!conlang[0]) throw new Error("Conlang not created");

  analyticsServerClient.capture({
    distinctId: userId,
    event: "conlang created",
    properties: {
      conlangId: conlang[0].id,
      conlangName: conlang[0].name,
      conlangIsPublic: conlang[0].isPublic,
    },
  });
}

export async function updateConlang(
  id: number,
  name: string,
  description?: string,
  emoji?: string,
  isPublic?: boolean,
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const conlang = await db
    .update(conlangs)
    .set({
      name,
      description,
      emoji,
      isPublic,
      updatedAt: new Date(),
    })
    .where(and(eq(conlangs.id, id), eq(conlangs.ownerId, userId)))
    .returning();

  if (!conlang[0]) throw new Error("Conlang not updated");
}

export async function deleteConlang(id: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(conlangs)
    .where(and(eq(conlangs.id, id), eq(conlangs.ownerId, userId)));

  analyticsServerClient.capture({
    distinctId: userId,
    event: "conlang deleted",
    properties: {
      conlangId: id,
    },
  });
}
// #endregion

// #region WORDS
export async function getWordsByConlangId(conlangId: number) {
  const words = await db.query.words.findMany({
    where: (model, { eq }) => eq(model.conlangId, conlangId),
    orderBy: (model, { asc }) => [asc(model.text)],
    with: { tags: { with: { tag: true } } },
  });
  const wordsWithTags = words.map((w) => ({
    ...w,
    tags: w.tags.map((t) => t.tag),
  }));
  return wordsWithTags;
}

export async function getWordById(id: number) {
  const word = await db.query.words.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    with: { tags: { with: { tag: true } } },
  });
  if (!word) throw new Error(`Word with id ${id} not found`);
  const wordWithTags = { ...word, tags: word.tags.map((t) => t.tag) };
  return wordWithTags;
}

export interface WordInsert {
  conlangId: number;
  text: string;
  pronunciation?: string;
  gloss?: string;
  definition?: string;
}

export async function insertWord(w: WordInsert) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const word = await db
    .insert(words)
    .values({
      ...w,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!word[0]) throw new Error("Word not created");
}

export interface WordUpdate {
  id: number;
  text: string;
  pronunciation?: string;
  gloss?: string;
  definition?: string;
}

export async function updateWord(w: WordUpdate) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const word = await db
    .update(words)
    .set({
      ...w,
      updatedAt: new Date(),
    })
    .where(eq(words.id, w.id))
    .returning();

  if (!word[0]) throw new Error("Word not updated");
}
// #endregion

// #region TAGS
export async function getAllWordTags() {
  const tags = await db.query.tags.findMany({
    where: (model, { eq }) => eq(model.type, "word"),
    orderBy: (model, { asc }) => [asc(model.text)],
  });

  return tags;
}

export async function getWordTagsForUser() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const userTags = await db
    .select({
      id: tags.id,
      name: tags.text,
    })
    .from(tags)
    .innerJoin(wordsToTags, eq(tags.id, wordsToTags.tagId))
    .innerJoin(words, eq(wordsToTags.wordId, words.id))
    .innerJoin(conlangs, eq(words.conlangId, conlangs.id))
    .where(and(eq(tags.type, "word"), eq(conlangs.ownerId, userId)));

  return userTags;
}

export interface TagInsert {
  text: string;
  type: TagType;
}

export async function insertTag(t: TagInsert) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const tag = await db.insert(tags).values(t).returning();

  if (!tag[0]) throw new Error("Tag not created");

  return tag[0];
}

export async function addWordTagRelation(wordId: number, tagId: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const word = await db
    .insert(wordsToTags)
    .values({
      wordId,
      tagId,
    })
    .returning();

  if (!word[0]) throw new Error("Tag not added to word");
}

export async function removeTagFromWord(wordId: number, tagId: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const word = await db
    .delete(wordsToTags)
    .where(and(eq(wordsToTags.wordId, wordId), eq(wordsToTags.tagId, tagId)))
    .returning();

  if (!word[0]) throw new Error("Tag not removed from word");
}
// #endregion

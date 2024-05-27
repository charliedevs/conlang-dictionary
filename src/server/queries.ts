import "server-only";

import { auth } from "@clerk/nextjs/server";

import { and, eq } from "drizzle-orm";
import analyticsServerClient from "./analytics";
import { db } from "./db";
import { conlangs, words } from "./db/schema";

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

// #regionWORDS
export async function getWordsByConlangId(conlangId: number) {
  const words = await db.query.words.findMany({
    where: (model, { eq }) => eq(model.conlangId, conlangId),
    orderBy: (model, { desc }) => desc(model.text),
  });

  return words;
}

export async function createWord(
  conlangId: number,
  text: string,
  pronunciation?: string,
  gloss?: string,
  definition?: string,
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const word = await db
    .insert(words)
    .values({
      conlangId,
      text,
      pronunciation,
      gloss,
      definition,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!word[0]) throw new Error("Word not created");
}
// #endregion

import "server-only";

import { auth } from "@clerk/nextjs/server";

import { and, eq } from "drizzle-orm";
import analyticsServerClient from "./analytics";
import { db } from "./db";
import { conlangs, images } from "./db/schema";

// CONLANGS
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

// IMAGES
export async function getMyImages() {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return images;
}

export async function getImageById(id: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!image) throw new Error("Image not found");

  if (image.userId !== userId) throw new Error("Unauthorized");

  return image;
}

export async function deleteImage(id: number) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(images)
    .where(and(eq(images.id, id), eq(images.userId, userId)));

  analyticsServerClient.capture({
    distinctId: userId,
    event: "image deleted",
    properties: {
      imageId: id,
    },
  });
}

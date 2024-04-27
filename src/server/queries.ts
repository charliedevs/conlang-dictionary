import "server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

// Get all images for current user
export async function getMyImages() {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return images;
}

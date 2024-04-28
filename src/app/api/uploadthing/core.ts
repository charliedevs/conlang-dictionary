import { auth, clerkClient } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { db } from "~/server/db";
import { images } from "~/server/db/schema";
import { ratelimit } from "~/server/ratelimit";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "1MB", maxFileCount: 10 } })
    .middleware(async () => {
      const { userId } = auth();
      if (!userId) throw new UploadThingError("Unauthorized");

      const fullUserData = await clerkClient.users.getUser(userId);
      if (fullUserData?.privateMetadata?.["can-upload"] !== true) {
        throw new UploadThingError("User does not have permission to upload");
      }

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new UploadThingError("Ratelimited");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      // Insert uploaded image into database
      await db.insert(images).values({
        name: file.name,
        url: file.url,
        userId: metadata.userId,
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

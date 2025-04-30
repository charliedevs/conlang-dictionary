"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function createLocalUser() {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  // Get user info from auth context
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const user = await clerkClient.users.getUser(userId);

  // Create user in our database
  const [localUser] = await db
    .insert(users)
    .values({
      clerkId,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      displayName: user.firstName ?? "User",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!localUser) {
    throw new Error("Failed to create local user");
  }

  return localUser;
}

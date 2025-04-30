import { auth, clerkClient } from "@clerk/nextjs/server";
import { type User } from "~/types/user";
import { db } from "./db";
import { users } from "./db/schema";

export async function getCurrentUser(): Promise<User> {
  const { userId: clerkId } = auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkId, clerkId),
  });

  if (!user) {
    // If user doesn't exist in our database yet, create them
    const clerkUser = await clerkClient.users.getUser(clerkId);

    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        displayName: clerkUser.firstName ?? "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newUser) throw new Error("Failed to create user");
    return newUser;
  }

  return user;
}

export async function isConlangOwner(conlangId: number) {
  const currentUser = await getCurrentUser();

  const conlang = await db.query.conlangs.findFirst({
    where: (conlangs, { eq }) => eq(conlangs.id, conlangId),
  });

  if (!conlang) return false;

  // Check both new and old owner fields for backward compatibility
  return (
    conlang.userId === currentUser.id || conlang.ownerId === currentUser.clerkId
  );
}

export async function requireOwnership(conlangId: number) {
  const isOwner = await isConlangOwner(conlangId);
  if (!isOwner) throw new Error("Unauthorized");
}

export async function getConlangAccess(conlangId: number) {
  const conlang = await db.query.conlangs.findFirst({
    where: (conlangs, { eq }) => eq(conlangs.id, conlangId),
  });

  if (!conlang) throw new Error("Conlang not found");

  // Public conlangs are accessible to everyone
  if (conlang.isPublic) return true;

  // Otherwise, check ownership
  return isConlangOwner(conlangId);
}

export async function requireConlangAccess(conlangId: number) {
  const hasAccess = await getConlangAccess(conlangId);
  if (!hasAccess) throw new Error("Unauthorized");
}

import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "../schema";

// Initialize db connection
const db = drizzle(sql, { schema });

async function migrateUsersData() {
  // Get all unique clerk IDs from existing tables
  const conlangOwners = await db
    .select({ ownerId: schema.conlangs.ownerId })
    .from(schema.conlangs);
  const tagCreators = await db
    .select({ createdBy: schema.tags.createdBy })
    .from(schema.tags);
  const lexicalCategoryOwners = await db
    .select({ ownerId: schema.lexicalCategories.ownerId })
    .from(schema.lexicalCategories);

  // Combine and deduplicate clerk IDs
  const clerkIds = new Set([
    ...conlangOwners.map((c) => c.ownerId),
    ...tagCreators.map((t) => t.createdBy).filter((id) => id !== null),
    ...lexicalCategoryOwners.map((l) => l.ownerId),
  ]);

  console.log(`Found ${clerkIds.size} unique clerk IDs to migrate`);

  // Create users for each clerk ID
  for (const clerkId of clerkIds) {
    try {
      // Skip if clerkId is null
      if (!clerkId) continue;

      console.log(`Migrating user ${clerkId}...`);

      // Get user info from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // Create user in our database
      const [user] = await db
        .insert(schema.users)
        .values({
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          displayName: clerkUser.firstName ?? "User",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!user) {
        console.error(`Failed to create user for clerk ID ${clerkId}`);
        continue;
      }

      console.log(`Created user ${user.id} for clerk ID ${clerkId}`);

      // Update references in conlangs table
      await db
        .update(schema.conlangs)
        .set({ userId: user.id })
        .where(eq(schema.conlangs.ownerId, clerkId));
      console.log(`Updated conlangs for user ${user.id}`);

      // Update references in tags table
      await db
        .update(schema.tags)
        .set({ userId: user.id })
        .where(eq(schema.tags.createdBy, clerkId));
      console.log(`Updated tags for user ${user.id}`);

      // Update references in lexicalCategories table
      await db
        .update(schema.lexicalCategories)
        .set({ userId: user.id })
        .where(eq(schema.lexicalCategories.ownerId, clerkId));
      console.log(`Updated lexical categories for user ${user.id}`);
    } catch (error) {
      console.error(`Error migrating user ${clerkId}:`, error);
    }
  }
}

// Run the migration if this file is executed directly
const isDirectlyExecuted = process.argv[1]?.endsWith(
  "0002_migrate_users_data.ts",
);
if (isDirectlyExecuted) {
  console.log("Starting user migration...");
  migrateUsersData()
    .then(() => {
      console.log("User migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error during user migration:", error);
      process.exit(1);
    });
}

export { migrateUsersData };

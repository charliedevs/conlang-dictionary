import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { lexicalCategories, lexicalSections } from "./db/schema";

// #region Lexical Sections

// Zod schemas for each section type's properties
const definitionProps = z.object({
  title: z.string().optional(),
  lexicalCategoryId: z.number(),
  definitionText: z.string().optional(),
  examples: z.array(z.string()).optional(),
});

const pronunciationProps = z.object({
  title: z.string().optional(),
  pronunciationText: z.string().optional(),
  ipa: z.string().optional(),
  audioUrl: z.string().optional(),
  region: z.string().optional(),
  phonemeIds: z.array(z.string()).optional(),
});

const etymologyProps = z.object({
  title: z.string().optional(),
  etymologyText: z.string().optional(),
});

const customTextProps = z.object({
  title: z.string().optional(),
  contentText: z.string().optional(),
});

const customFieldsProps = z.object({
  title: z.string().optional(),
  customFields: z.record(z.unknown()),
});

// Discriminated union for the full insert schema
export const insertLexicalSectionSchema = z.discriminatedUnion("sectionType", [
  z.object({
    sectionType: z.literal("definition"),
    wordId: z.number(),
    order: z.number().optional(),
    properties: definitionProps,
  }),
  z.object({
    sectionType: z.literal("pronunciation"),
    wordId: z.number(),
    order: z.number().optional(),
    properties: pronunciationProps,
  }),
  z.object({
    sectionType: z.literal("etymology"),
    wordId: z.number(),
    order: z.number().optional(),
    properties: etymologyProps,
  }),
  z.object({
    sectionType: z.literal("custom_text"),
    wordId: z.number(),
    order: z.number().optional(),
    properties: customTextProps,
  }),
  z.object({
    sectionType: z.literal("custom_fields"),
    wordId: z.number(),
    order: z.number().optional(),
    properties: customFieldsProps,
  }),
]);

export type InsertLexicalSectionInput = z.infer<
  typeof insertLexicalSectionSchema
>;

export async function insertLexicalSection(input: InsertLexicalSectionInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate input (redundant if already validated at API layer, but safe)
  const parsed = insertLexicalSectionSchema.parse(input);

  const newSection = await db
    .insert(lexicalSections)
    .values({
      wordId: parsed.wordId,
      sectionType: parsed.sectionType,
      order: parsed.order ?? 0,
      properties: parsed.properties,
    })
    .returning();

  if (!newSection[0]) throw new Error("Failed to insert lexical section");

  return newSection[0];
}

export interface LexicalSectionOrderUpdate {
  id: string;
  order: number;
}

export async function updateLexicalSectionOrders(
  updates: LexicalSectionOrderUpdate[],
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const results: Partial<typeof lexicalSections.$inferSelect>[] = [];

  await db.transaction(async (tx) => {
    for (const update of updates) {
      const [updated] = await tx
        .update(lexicalSections)
        .set({ order: update.order })
        .where(eq(lexicalSections.id, update.id))
        .returning();

      if (updated) results.push(updated);
    }
  });
}

// #endregion Lexical Sections

// #region Lexical Categories

export interface LexicalCategoryInsert {
  category: string;
  conlangId: number;
}

export async function insertLexicalCategory(l: LexicalCategoryInsert) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const lexicalCategory = await db
    .insert(lexicalCategories)
    .values({
      ...l,
      ownerId: userId,
    })
    .returning();

  if (!lexicalCategory[0]) throw new Error("Lexical category not created");
  return lexicalCategory[0];
}

// #endregion Lexical Categories

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import {
  CustomFieldsSectionProperties,
  CustomTextSectionProperties,
  DefinitionSectionProperties,
  EtymologySectionProperties,
  PronunciationSectionProperties,
  SectionType,
} from "~/types/word";
import { db } from "./db";
import { lexicalCategories, lexicalSections } from "./db/schema";

// #region Lexical Sections

export type InsertLexicalSectionInput = {
  sectionType: SectionType;
  wordId: number;
  order?: number;
  properties:
    | DefinitionSectionProperties
    | PronunciationSectionProperties
    | EtymologySectionProperties
    | CustomTextSectionProperties
    | CustomFieldsSectionProperties;
};

export async function insertLexicalSection(input: InsertLexicalSectionInput) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  if (!input.wordId || !input.sectionType || !input.properties) {
    throw new Error("Missing required fields");
  }

  const newSection = await db
    .insert(lexicalSections)
    .values({
      wordId: input.wordId,
      sectionType: input.sectionType,
      order: input.order ?? 0,
      properties: input.properties,
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

export type UpdateLexicalSectionPropertiesInput =
  | { sectionType: "definition"; properties: DefinitionSectionProperties }
  | { sectionType: "pronunciation"; properties: PronunciationSectionProperties }
  | { sectionType: "etymology"; properties: EtymologySectionProperties }
  | { sectionType: "custom_text"; properties: CustomTextSectionProperties }
  | { sectionType: "custom_fields"; properties: CustomFieldsSectionProperties };

export async function updateLexicalSectionProperties(
  sectionId: string,
  input: UpdateLexicalSectionPropertiesInput,
) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const updated = await db
    .update(lexicalSections)
    .set({ properties: input.properties })
    .where(eq(lexicalSections.id, sectionId))
    .returning();

  if (!updated[0]) throw new Error("Failed to update lexical section");
  return updated[0];
}

export async function deleteLexicalSection(sectionId: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const deleted = await db
    .delete(lexicalSections)
    .where(eq(lexicalSections.id, sectionId))
    .returning();

  if (!deleted[0]) throw new Error("Failed to delete lexical section");
  return deleted[0];
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

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { planTagsToCreate } from "~/lib/conlang-export/plan-import";
import type {
  ConlangExport,
  LexicalSectionExport,
} from "~/types/conlang-export";
import type {
  CustomFieldsSectionProperties,
  CustomTextSectionProperties,
  DefinitionSectionProperties,
  EtymologySectionProperties,
  PronunciationSectionProperties,
  SectionType,
} from "~/types/word";
import { db } from "./db";
import {
  conlangs,
  lexicalCategories,
  lexicalSections,
  tags,
  words,
  wordsToTags,
} from "./db/schema";

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

// #region Import

/** Awaits a single-row `.returning()` insert, throwing if it came back empty. */
async function insertOneOrThrow<T>(
  rows: Promise<T[]>,
  errorMessage: string,
): Promise<T> {
  const [row] = await rows;
  if (!row) throw new Error(errorMessage);
  return row;
}

function remapSectionProperties(
  section: LexicalSectionExport,
  categoryIdByLocalId: Map<number, number>,
) {
  if (section.sectionType !== "definition") return section.properties;

  const lexicalCategoryId = categoryIdByLocalId.get(
    section.properties.lexicalCategoryId,
  );
  if (lexicalCategoryId === undefined) {
    throw new Error("Import references an unknown lexical category");
  }
  return { ...section.properties, lexicalCategoryId };
}

/**
 * Recreates a conlang (details + lexicon) from a previously exported
 * `ConlangExport` file, owned by the current user. Runs as a single
 * transaction: any failure rolls back everything inserted so far,
 * so a bad import never leaves a half-created conlang behind.
 *
 * DB ids are never trusted from the file — lexical categories are
 * remapped from their file-local `localId` to freshly-inserted ids,
 * and tags are resolved by text (find-or-create) since tags are
 * shared/global rather than scoped to a conlang.
 */
export async function importConlang(input: {
  conlangName: string;
  data: ConlangExport;
}) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  return await db.transaction(async (tx) => {
    const newConlang = await insertOneOrThrow(
      tx
        .insert(conlangs)
        .values({
          name: input.conlangName,
          description: input.data.conlang.description ?? "",
          emoji: input.data.conlang.emoji,
          isPublic: false,
          ownerId: userId,
        })
        .returning(),
      "Failed to create conlang",
    );

    const categoryIdByLocalId = new Map<number, number>();
    for (const category of input.data.lexicalCategories) {
      const inserted = await insertOneOrThrow(
        tx
          .insert(lexicalCategories)
          .values({
            category: category.category,
            conlangId: newConlang.id,
            ownerId: userId,
          })
          .returning(),
        "Failed to create lexical category",
      );
      categoryIdByLocalId.set(category.localId, inserted.id);
    }

    const existingTags = await tx.query.tags.findMany({
      where: (model, { eq }) => eq(model.type, "word"),
      columns: { id: true, text: true },
    });
    const tagIdByText = new Map(existingTags.map((t) => [t.text, t.id]));
    const tagsToCreate = planTagsToCreate(
      input.data,
      new Set(tagIdByText.keys()),
    );
    for (const tag of tagsToCreate) {
      const inserted = await insertOneOrThrow(
        tx
          .insert(tags)
          .values({
            text: tag.text,
            type: "word",
            color: tag.color,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(),
        "Failed to create tag",
      );
      tagIdByText.set(tag.text, inserted.id);
    }

    for (const word of input.data.words) {
      const newWord = await insertOneOrThrow(
        tx
          .insert(words)
          .values({
            conlangId: newConlang.id,
            text: word.text,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(),
        "Failed to create word",
      );

      for (const section of word.lexicalSections) {
        await tx.insert(lexicalSections).values({
          wordId: newWord.id,
          sectionType: section.sectionType,
          order: section.order,
          properties: remapSectionProperties(section, categoryIdByLocalId),
        });
      }

      const uniqueTagTexts = new Set(word.tags.map((tag) => tag.text));
      for (const text of uniqueTagTexts) {
        const tagId = tagIdByText.get(text);
        if (tagId === undefined) {
          throw new Error(`Import references an unresolved tag: ${text}`);
        }
        await tx.insert(wordsToTags).values({ wordId: newWord.id, tagId });
      }
    }

    return { id: newConlang.id };
  });
}

// #endregion Import

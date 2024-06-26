// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `conlang-dictionary_${name}`,
);

// Main conlang table
export const conlangs = createTable(
  "conlang",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    ownerId: varchar("ownerId", { length: 256 }).notNull(),
    isPublic: boolean("isPublic").notNull().default(false),
    description: varchar("description", { length: 1024 }).notNull().default(""),
    emoji: text("emoji"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (conlang) => ({
    conlangNameIndex: index("conlang_name_idx").on(conlang.name),
  }),
);

// Words
export const words = createTable(
  "word",
  {
    id: serial("id").primaryKey(),
    conlangId: integer("conlangId")
      .notNull()
      .references(() => conlangs.id),
    text: varchar("text", { length: 512 }).notNull(),
    pronunciation: varchar("pronunciation", { length: 512 }),
    gloss: varchar("gloss", { length: 512 }),
    definition: varchar("definition", { length: 1024 }),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (word) => ({
    wordTextIndex: index("word_text_idx").on(word.text),
  }),
);

export const wordsRelations = relations(words, ({ many }) => ({
  tags: many(wordsToTags),
}));

// Tags
export const tagType = pgEnum("tagType", ["word", "conlang"]);
export const tagColor = pgEnum("tagColor", [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "neutral",
]);
export const tags = createTable("tag", {
  id: serial("id").primaryKey(),
  text: varchar("tag", { length: 256 }).notNull(),
  type: tagType("type").notNull(),
  color: tagColor("color"),
  createdBy: varchar("createdBy", { length: 256 }),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  words: many(wordsToTags),
}));

// Table for many-to-many relationship between words and tags
export const wordsToTags = createTable(
  "wordsToTags",
  {
    wordId: integer("wordId")
      .notNull()
      .references(() => words.id),
    tagId: integer("tagId")
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.wordId, t.tagId] }),
  }),
);

export const wordsToTagsRelations = relations(wordsToTags, ({ one }) => ({
  tag: one(tags, {
    fields: [wordsToTags.tagId],
    references: [tags.id],
  }),
  word: one(words, {
    fields: [wordsToTags.wordId],
    references: [words.id],
  }),
}));

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

// Users table
export const users = createTable("user", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerkId", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull(),
  displayName: varchar("displayName", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt"),
});

// Main conlang table
export const conlangs = createTable(
  "conlang",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull().unique(),
    ownerId: varchar("ownerId", { length: 256 }).notNull(),
    userId: integer("userId").references(() => users.id),
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

export const conlangsRelations = relations(conlangs, ({ one }) => ({
  owner: one(users, {
    fields: [conlangs.userId],
    references: [users.id],
  }),
}));

// Words
export const words = createTable(
  "word",
  {
    id: serial("id").primaryKey(),
    conlangId: integer("conlangId")
      .notNull()
      .references(() => conlangs.id),
    text: varchar("text", { length: 512 }).notNull(),
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
  wordSections: many(wordSections),
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
  userId: integer("userId").references(() => users.id),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const tagsRelations = relations(tags, ({ many, one }) => ({
  words: many(wordsToTags),
  creator: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
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

// Word Sections //
export const wordSections = createTable("wordSections", {
  id: serial("id").primaryKey(),
  wordId: integer("wordId").notNull(),
  title: text("title"),
  order: integer("order").notNull().default(0),
});
export const wordSectionsRelations = relations(wordSections, ({ one }) => ({
  word: one(words, {
    fields: [wordSections.wordId],
    references: [words.id],
  }),
  definitionSection: one(definitionSections, {
    fields: [wordSections.id],
    references: [definitionSections.wordSectionId],
  }),
  customSection: one(customSections, {
    fields: [wordSections.id],
    references: [customSections.wordSectionId],
  }),
}));

// Custom Sections
export const customSections = createTable("customSections", {
  id: serial("id").primaryKey(),
  wordSectionId: integer("wordSectionId").notNull(),
  text: text("text").notNull().default(""),
});
export const customSectionsRelations = relations(customSections, ({ one }) => ({
  wordSection: one(wordSections, {
    fields: [customSections.wordSectionId],
    references: [wordSections.id],
  }),
}));

// Definition Sections
export const lexicalCategories = createTable("lexicalCategories", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  conlangId: integer("conlangId")
    .notNull()
    .references(() => conlangs.id),
  ownerId: varchar("ownerId", { length: 256 }).notNull(),
  userId: integer("userId").references(() => users.id),
});

export const lexicalCategoriesRelations = relations(
  lexicalCategories,
  ({ one }) => ({
    owner: one(users, {
      fields: [lexicalCategories.userId],
      references: [users.id],
    }),
    conlang: one(conlangs, {
      fields: [lexicalCategories.conlangId],
      references: [conlangs.id],
    }),
  }),
);

export const definitionSections = createTable("definitionSections", {
  id: serial("id").primaryKey(),
  wordSectionId: integer("wordSectionId").notNull(),
  lexicalCategoryId: integer("lexicalCategoryId").notNull(),
});
export const definitionSectionsRelations = relations(
  definitionSections,
  ({ one, many }) => ({
    wordSection: one(wordSections, {
      fields: [definitionSections.wordSectionId],
      references: [wordSections.id],
    }),
    lexicalCategory: one(lexicalCategories, {
      fields: [definitionSections.lexicalCategoryId],
      references: [lexicalCategories.id],
    }),
    definitions: many(definitions),
  }),
);

export const definitions = createTable("definitions", {
  id: serial("id").primaryKey(),
  definitionSectionId: integer("definitionSectionId").notNull(),
  text: text("text").notNull().default(""),
});
export const definitionsRelations = relations(definitions, ({ one }) => ({
  definitionSection: one(definitionSections, {
    fields: [definitions.definitionSectionId],
    references: [definitionSections.id],
  }),
}));

// TODO: Add other section types one at a time and test
// export const pronunciations = createTable("pronunciations", {
//   id: serial("id").primaryKey(),
//   ipa: text("ipa"),
// });

// // table for related words that allows many to many between words
// export const relatedWords = createTable(
//   "relatedWords",
//   {
//     wordId: integer("wordId")
//       .notNull()
//       .references(() => words.id),
//     relatedWordId: integer("tagId")
//       .notNull()
//       .references(() => tags.id),
//   },
//   (r) => ({
//     pk: primaryKey({ columns: [r.wordId, r.relatedWordId] }),
//   }),
// );

// export const relatedWordsRelations = relations(relatedWords, ({ one }) => ({
//   word: one(words, {
//     fields: [relatedWords.wordId],
//     references: [words.id],
//   }),
//   relatedWord: one(words, {
//     fields: [relatedWords.relatedWordId],
//     references: [words.id],
//   }),
// }));

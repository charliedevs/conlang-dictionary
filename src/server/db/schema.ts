import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { env } from "../../env";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `${env.TABLE_PREFIX}${name}`,
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
  lexicalSections: many(lexicalSections),
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
});

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

// New lexical Sections Table (Using JSONB)
// This table replaces the old wordSections, definitionSections, customSections structure
export const sectionType = pgEnum("sectionType", [
  "definition",
  "pronunciation",
  "etymology",
  "custom_text",
  "custom_fields",
]);
export const lexicalSections = createTable(
  "lexicalSections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wordId: integer("wordId")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    sectionType: sectionType("sectionType").notNull(),
    order: integer("order").notNull().default(0),
    properties: jsonb("properties").notNull().default("{}"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (section) => ({
    wordIdIndex: index("lexical_sections_word_id_idx").on(section.wordId),
    sectionTypeIndex: index("lexical_sections_type_idx").on(
      section.sectionType,
    ),
    // GIN index on properties is crucial for querying JSONB efficiently
    // Use jsonb_ops for general key/value existence and containment checks (@>,?,?|,?&)
    propertiesIndex: index("lexical_sections_properties_gin_idx").using(
      "gin",
      section.properties,
    ),
  }),
);

export const lexicalSectionsRelations = relations(
  lexicalSections,
  ({ one }) => ({
    word: one(words, {
      fields: [lexicalSections.wordId],
      references: [words.id],
      relationName: "lexicalSectionsToWord",
    }),
  }),
);

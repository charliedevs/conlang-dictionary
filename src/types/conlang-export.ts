import { z } from "zod";

/**
 * Shape of a conlang export/import file (JSON).
 *
 * Deliberately excludes DB ids, ownerId, and isPublic — those are
 * account-specific and get assigned fresh on import. `lexicalCategories`
 * use a file-local `localId` (not a DB id) so `definition` sections can
 * reference a category without depending on any particular database.
 *
 * NOTE: sectionType/tagColor values below must stay in sync with the
 * `sectionType`/`tagColor` pgEnums in `~/server/db/schema`. They're
 * duplicated here (rather than imported at runtime) so this module stays
 * safe to import from client components without pulling in server-only code.
 */

export const EXPORT_FORMAT_VERSION = 1;

const SECTION_TYPES = [
  "definition",
  "pronunciation",
  "etymology",
  "custom_text",
  "custom_fields",
] as const;

const TAG_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "neutral",
] as const;

const ipaEntrySchema = z.object({
  label: z.string().optional(),
  value: z.string(),
});

const definitionPropertiesSchema = z.object({
  title: z.string().optional(),
  // References lexicalCategories[].localId within this same file.
  lexicalCategoryId: z.number(),
  definitionText: z.string().optional(),
  examples: z.array(z.string()).optional(),
});

const pronunciationPropertiesSchema = z.object({
  title: z.string().optional(),
  ipaEntries: z.array(ipaEntrySchema).optional(),
  audioUrl: z.string().optional(),
  region: z.string().optional(),
  phonemeIds: z.array(z.string()).optional(),
  pronunciationText: z.string().optional(),
  displayLinkForIPA: z.boolean().optional(),
});

const etymologyPropertiesSchema = z.object({
  title: z.string().optional(),
  etymologyText: z.string().optional(),
});

const customTextPropertiesSchema = z.object({
  title: z.string().optional(),
  contentText: z.string().optional(),
});

const customFieldsPropertiesSchema = z.object({
  title: z.string().optional(),
  customFields: z.record(z.string()),
});

const lexicalSectionExportSchema = z.discriminatedUnion("sectionType", [
  z.object({
    sectionType: z.literal(SECTION_TYPES[0]),
    order: z.number(),
    properties: definitionPropertiesSchema,
  }),
  z.object({
    sectionType: z.literal(SECTION_TYPES[1]),
    order: z.number(),
    properties: pronunciationPropertiesSchema,
  }),
  z.object({
    sectionType: z.literal(SECTION_TYPES[2]),
    order: z.number(),
    properties: etymologyPropertiesSchema,
  }),
  z.object({
    sectionType: z.literal(SECTION_TYPES[3]),
    order: z.number(),
    properties: customTextPropertiesSchema,
  }),
  z.object({
    sectionType: z.literal(SECTION_TYPES[4]),
    order: z.number(),
    properties: customFieldsPropertiesSchema,
  }),
]);

const wordTagExportSchema = z.object({
  text: z.string(),
  color: z.enum(TAG_COLORS).nullable().optional(),
});

const wordExportSchema = z.object({
  text: z.string(),
  tags: z.array(wordTagExportSchema),
  lexicalSections: z.array(lexicalSectionExportSchema),
});

const lexicalCategoryExportSchema = z.object({
  localId: z.number(),
  category: z.string(),
});

export const conlangExportSchema = z.object({
  formatVersion: z.literal(EXPORT_FORMAT_VERSION),
  exportedAt: z.string(),
  conlang: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    emoji: z.string().optional(),
  }),
  lexicalCategories: z.array(lexicalCategoryExportSchema),
  words: z.array(wordExportSchema),
});

export type ConlangExport = z.infer<typeof conlangExportSchema>;
export type LexicalCategoryExport = z.infer<typeof lexicalCategoryExportSchema>;
export type WordExport = z.infer<typeof wordExportSchema>;
export type LexicalSectionExport = z.infer<typeof lexicalSectionExportSchema>;
export type WordTagExport = z.infer<typeof wordTagExportSchema>;

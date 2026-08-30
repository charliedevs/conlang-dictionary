/**
 * Character limits for the word/section forms in the lexicon.
 *
 * `WORD_TEXT_MAX_LENGTH` matches the `words.text` varchar(512) column in
 * schema.ts — exceeding it fails at the DB layer, so the UI must match it
 * exactly. The rest of a lexical section's content lives in an unbounded
 * `jsonb` column with no DB-enforced cap, so these are product-chosen
 * ceilings (generous for real dictionary entries, small enough to keep
 * forms and rendered word pages usable).
 */
export const WORD_TEXT_MAX_LENGTH = 512;
export const SECTION_TITLE_MAX_LENGTH = 100;
export const SECTION_RICH_TEXT_MAX_LENGTH = 5000;
export const EXAMPLE_SENTENCE_MAX_LENGTH = 300;
export const IPA_LABEL_MAX_LENGTH = 40;
export const IPA_VALUE_MAX_LENGTH = 100;
export const AUDIO_URL_MAX_LENGTH = 2048;
export const CUSTOM_FIELD_KEY_MAX_LENGTH = 60;
export const CUSTOM_FIELD_VALUE_MAX_LENGTH = 500;

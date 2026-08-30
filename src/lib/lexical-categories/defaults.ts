/**
 * Common parts of speech offered as one-click suggestions when a conlang is
 * missing them. Stored lowercase to match how categories are normalized on
 * insert. This is a gentle guide, not a mandate — conlangs are free to use any
 * categories, and these only ever appear as opt-in suggestions.
 */
export const DEFAULT_LEXICAL_CATEGORIES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
] as const;

/** Normalize a category name for storage and comparison: trimmed, lowercased. */
export function normalizeCategoryName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

/**
 * The default categories a conlang does not already have, in canonical order.
 * Comparison is case- and whitespace-insensitive; non-default existing
 * categories are ignored.
 */
export function missingDefaultCategories(
  existing: readonly string[],
  defaults: readonly string[] = DEFAULT_LEXICAL_CATEGORIES,
): string[] {
  const have = new Set(existing.map(normalizeCategoryName));
  return defaults.filter((name) => !have.has(normalizeCategoryName(name)));
}

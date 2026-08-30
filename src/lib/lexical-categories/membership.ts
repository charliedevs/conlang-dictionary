import { type LexicalSection } from "~/types/word";

/**
 * Like `Pick`, but distributes across each member of a union so a
 * discriminated union keeps each discriminant paired with its own fields. A
 * plain `Pick<LexicalSection, ...>` would collapse the members and sever the
 * `sectionType`→`properties` correlation we rely on for narrowing.
 */
type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;

/**
 * A word reduced to just what lexical-category membership depends on: its id
 * and the `sectionType`/`properties` of each section. A full `Word` from the
 * DB satisfies this, but keeping the shape minimal makes the logic pure and
 * cheap to test. Narrowing on `sectionType === "definition"` still types
 * `properties` as `DefinitionSectionProperties`.
 */
export interface CategorizedWord {
  id: number;
  lexicalSections: ReadonlyArray<
    DistributivePick<LexicalSection, "sectionType" | "properties">
  >;
}

/**
 * The distinct lexical categories a word belongs to. Membership comes from a
 * word's definition sections; a word with two definitions in the same category
 * is counted once.
 */
export function categoryIdsForWord(word: CategorizedWord): Set<number> {
  const ids = new Set<number>();
  for (const section of word.lexicalSections) {
    if (section.sectionType === "definition") {
      ids.add(section.properties.lexicalCategoryId);
    }
  }
  return ids;
}

/** Whether a word has any definition in the given lexical category. */
export function wordInCategory(
  word: CategorizedWord,
  categoryId: number,
): boolean {
  return categoryIdsForWord(word).has(categoryId);
}

/** The words that belong to the given lexical category, order preserved. */
export function filterWordsInCategory<T extends CategorizedWord>(
  words: readonly T[],
  categoryId: number,
): T[] {
  return words.filter((word) => wordInCategory(word, categoryId));
}

/**
 * Number of distinct words in each lexical category, keyed by category id.
 * Categories that no word belongs to are absent from the map.
 */
export function countWordsByCategory(
  words: readonly CategorizedWord[],
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const word of words) {
    for (const categoryId of categoryIdsForWord(word)) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
  }
  return counts;
}

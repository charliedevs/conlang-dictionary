import { describe, expect, it } from "vitest";
import {
  categoryIdsForWord,
  countWordsByCategory,
  filterWordsInCategory,
  wordInCategory,
  type CategorizedWord,
} from "./membership";

/**
 * Test fixtures use the minimal `CategorizedWord` shape: an id plus the
 * `sectionType`/`properties` pair that category membership depends on.
 */
function defWord(id: number, ...categoryIds: number[]): CategorizedWord {
  return {
    id,
    lexicalSections: categoryIds.map((lexicalCategoryId) => ({
      sectionType: "definition" as const,
      properties: { lexicalCategoryId },
    })),
  };
}

describe("categoryIdsForWord", () => {
  it("returns the category id of a single definition section", () => {
    expect([...categoryIdsForWord(defWord(1, 7))]).toEqual([7]);
  });

  it("deduplicates when several definition sections share a category", () => {
    expect([...categoryIdsForWord(defWord(1, 3, 3))]).toEqual([3]);
  });

  it("collects every distinct category the word belongs to", () => {
    expect([...categoryIdsForWord(defWord(1, 3, 5))].sort()).toEqual([3, 5]);
  });

  it("ignores non-definition sections", () => {
    const word: CategorizedWord = {
      id: 1,
      lexicalSections: [
        { sectionType: "pronunciation", properties: {} },
        { sectionType: "etymology", properties: {} },
      ],
    };
    expect([...categoryIdsForWord(word)]).toEqual([]);
  });

  it("is empty for a word with no sections", () => {
    expect([...categoryIdsForWord({ id: 1, lexicalSections: [] })]).toEqual([]);
  });
});

describe("wordInCategory", () => {
  it("is true when a definition section matches the category", () => {
    expect(wordInCategory(defWord(1, 4), 4)).toBe(true);
  });

  it("is false when no section matches", () => {
    expect(wordInCategory(defWord(1, 4), 9)).toBe(false);
  });
});

describe("filterWordsInCategory", () => {
  it("returns only words that belong to the category", () => {
    const words = [defWord(1, 2), defWord(2, 3), defWord(3, 2, 3)];
    expect(filterWordsInCategory(words, 2).map((w) => w.id)).toEqual([1, 3]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterWordsInCategory([defWord(1, 2)], 99)).toEqual([]);
  });
});

describe("countWordsByCategory", () => {
  it("counts one word per category", () => {
    const counts = countWordsByCategory([defWord(1, 5), defWord(2, 5)]);
    expect(counts.get(5)).toBe(2);
  });

  it("counts a word once even with duplicate definition sections", () => {
    const counts = countWordsByCategory([defWord(1, 5, 5)]);
    expect(counts.get(5)).toBe(1);
  });

  it("counts a word in each category it belongs to", () => {
    const counts = countWordsByCategory([defWord(1, 5, 6)]);
    expect(counts.get(5)).toBe(1);
    expect(counts.get(6)).toBe(1);
  });

  it("returns an empty map for no words", () => {
    expect(countWordsByCategory([]).size).toBe(0);
  });

  it("omits categories no word belongs to", () => {
    const counts = countWordsByCategory([defWord(1, 5)]);
    expect(counts.has(6)).toBe(false);
  });
});

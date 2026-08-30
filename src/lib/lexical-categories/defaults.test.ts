import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEXICAL_CATEGORIES,
  missingDefaultCategories,
  normalizeCategoryName,
} from "./defaults";

describe("normalizeCategoryName", () => {
  it("trims surrounding whitespace and lowercases", () => {
    expect(normalizeCategoryName("  Noun ")).toBe("noun");
    expect(normalizeCategoryName("VERB")).toBe("verb");
  });
});

describe("missingDefaultCategories", () => {
  it("returns every default when none exist yet", () => {
    expect(missingDefaultCategories([])).toEqual([...DEFAULT_LEXICAL_CATEGORIES]);
  });

  it("omits defaults already present, case- and whitespace-insensitively", () => {
    const missing = missingDefaultCategories(["Noun", " VERB "]);
    expect(missing).not.toContain("noun");
    expect(missing).not.toContain("verb");
    expect(missing).toContain("adjective");
  });

  it("preserves the canonical default order", () => {
    const missing = missingDefaultCategories(["adjective"]);
    expect(missing).toEqual([
      "noun",
      "verb",
      "adverb",
      "pronoun",
      "preposition",
      "conjunction",
      "interjection",
    ]);
  });

  it("ignores existing categories that aren't defaults", () => {
    expect(missingDefaultCategories(["evidential", "classifier"])).toEqual([
      ...DEFAULT_LEXICAL_CATEGORIES,
    ]);
  });

  it("returns an empty list once every default is present", () => {
    expect(missingDefaultCategories([...DEFAULT_LEXICAL_CATEGORIES])).toEqual([]);
  });

  it("accepts a custom default set", () => {
    expect(missingDefaultCategories(["noun"], ["noun", "particle"])).toEqual([
      "particle",
    ]);
  });
});

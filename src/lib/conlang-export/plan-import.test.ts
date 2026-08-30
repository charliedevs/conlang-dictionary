import { describe, expect, it } from "vitest";
import { type ConlangExport } from "~/types/conlang-export";
import { planTagsToCreate } from "./plan-import";

function exportWithWords(
  words: ConlangExport["words"],
): ConlangExport {
  return {
    formatVersion: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    conlang: { name: "Elvish" },
    lexicalCategories: [],
    words,
  };
}

describe("planTagsToCreate", () => {
  it("returns an empty list when there are no tags", () => {
    const plan = planTagsToCreate(exportWithWords([]), new Set());
    expect(plan).toEqual([]);
  });

  it("excludes tags whose text already exists", () => {
    const plan = planTagsToCreate(
      exportWithWords([
        { text: "amar", tags: [{ text: "verb-root", color: "blue" }], lexicalSections: [] },
      ]),
      new Set(["verb-root"]),
    );
    expect(plan).toEqual([]);
  });

  it("dedupes the same tag text appearing on multiple words", () => {
    const plan = planTagsToCreate(
      exportWithWords([
        { text: "amar", tags: [{ text: "verb-root", color: "blue" }], lexicalSections: [] },
        { text: "mellon", tags: [{ text: "verb-root", color: "blue" }], lexicalSections: [] },
      ]),
      new Set(),
    );
    expect(plan).toEqual([{ text: "verb-root", color: "blue" }]);
  });

  it("keeps the first occurrence's color when the same text appears with different colors", () => {
    const plan = planTagsToCreate(
      exportWithWords([
        { text: "amar", tags: [{ text: "verb-root", color: "blue" }], lexicalSections: [] },
        { text: "mellon", tags: [{ text: "verb-root", color: "red" }], lexicalSections: [] },
      ]),
      new Set(),
    );
    expect(plan).toEqual([{ text: "verb-root", color: "blue" }]);
  });

  it("includes multiple distinct new tags", () => {
    const plan = planTagsToCreate(
      exportWithWords([
        {
          text: "amar",
          tags: [
            { text: "verb-root", color: "blue" },
            { text: "archaic", color: null },
          ],
          lexicalSections: [],
        },
      ]),
      new Set(),
    );
    expect(plan).toEqual([
      { text: "verb-root", color: "blue" },
      { text: "archaic", color: null },
    ]);
  });
});

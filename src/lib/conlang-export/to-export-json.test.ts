import { describe, expect, it } from "vitest";
import { EXPORT_FORMAT_VERSION } from "~/types/conlang-export";
import { serializeConlangExport, type ConlangExportSourceData } from "./to-export-json";

function baseSource(
  overrides: Partial<ConlangExportSourceData> = {},
): ConlangExportSourceData {
  return {
    conlang: { name: "Elvish", description: "A forest tongue", emoji: "🌳" },
    lexicalCategories: [],
    words: [],
    ...overrides,
  };
}

describe("serializeConlangExport", () => {
  it("carries over conlang details and stamps a format version + timestamp", () => {
    const result = serializeConlangExport(baseSource());

    expect(result.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(result.conlang).toEqual({
      name: "Elvish",
      description: "A forest tongue",
      emoji: "🌳",
    });
    expect(() => new Date(result.exportedAt).toISOString()).not.toThrow();
  });

  it("assigns file-local ids to lexical categories, independent of DB ids", () => {
    const result = serializeConlangExport(
      baseSource({
        lexicalCategories: [
          { id: 47, category: "noun" },
          { id: 12, category: "verb" },
        ],
      }),
    );

    expect(result.lexicalCategories).toEqual([
      { localId: 1, category: "noun" },
      { localId: 2, category: "verb" },
    ]);
  });

  it("remaps a definition section's lexicalCategoryId to the matching localId", () => {
    const result = serializeConlangExport(
      baseSource({
        lexicalCategories: [{ id: 47, category: "noun" }],
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "definition",
                order: 0,
                properties: {
                  lexicalCategoryId: 47,
                  definitionText: "*love*",
                  examples: ["amar an elenath"],
                },
              },
            ],
          },
        ],
      }),
    );

    expect(result.words[0]?.lexicalSections[0]).toEqual({
      sectionType: "definition",
      order: 0,
      properties: {
        title: undefined,
        lexicalCategoryId: 1,
        definitionText: "*love*",
        examples: ["amar an elenath"],
      },
    });
  });

  it("throws if a definition section references a category that isn't in lexicalCategories", () => {
    expect(() =>
      serializeConlangExport(
        baseSource({
          words: [
            {
              text: "amar",
              tags: [],
              lexicalSections: [
                {
                  sectionType: "definition",
                  order: 0,
                  properties: { lexicalCategoryId: 999 },
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow(/unknown lexical category/i);
  });

  it("passes through non-definition section properties unchanged", () => {
    const result = serializeConlangExport(
      baseSource({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "pronunciation",
                order: 0,
                properties: {
                  ipaEntries: [{ value: "ˈɑ.mɑr" }],
                  pronunciationText: "AH-mar",
                },
              },
            ],
          },
        ],
      }),
    );

    expect(result.words[0]?.lexicalSections[0]).toEqual({
      sectionType: "pronunciation",
      order: 0,
      properties: {
        ipaEntries: [{ value: "ˈɑ.mɑr" }],
        pronunciationText: "AH-mar",
      },
    });
  });

  it("serializes tags by value, dropping ids", () => {
    const result = serializeConlangExport(
      baseSource({
        words: [
          {
            text: "amar",
            tags: [{ text: "verb-root", color: "blue" }],
            lexicalSections: [],
          },
        ],
      }),
    );

    expect(result.words[0]?.tags).toEqual([
      { text: "verb-root", color: "blue" },
    ]);
  });
});

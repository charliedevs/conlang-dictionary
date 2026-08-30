import { describe, expect, it } from "vitest";
import { type ConlangExport } from "~/types/conlang-export";
import { conlangExportToMarkdown } from "./to-markdown";

function baseExport(overrides: Partial<ConlangExport> = {}): ConlangExport {
  return {
    formatVersion: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    conlang: { name: "Elvish" },
    lexicalCategories: [],
    words: [],
    ...overrides,
  };
}

describe("conlangExportToMarkdown", () => {
  it("renders the conlang name as an h1, with emoji prefixed and description below", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        conlang: { name: "Elvish", description: "A forest tongue", emoji: "🌳" },
      }),
    );

    expect(md).toContain("# 🌳 Elvish");
    expect(md).toContain("A forest tongue");
  });

  it("omits the emoji prefix and description when absent", () => {
    const md = conlangExportToMarkdown(baseExport());

    expect(md.startsWith("# Elvish")).toBe(true);
  });

  it("renders each word as an h2 heading", () => {
    const md = conlangExportToMarkdown(
      baseExport({ words: [{ text: "amar", tags: [], lexicalSections: [] }] }),
    );

    expect(md).toContain("## amar");
  });

  it("renders a definition section under its lexical category name, with examples as blockquotes", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        lexicalCategories: [{ localId: 1, category: "noun" }],
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "definition",
                order: 0,
                properties: {
                  lexicalCategoryId: 1,
                  definitionText: "*love*",
                  examples: ["amar an elenath"],
                },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**noun**");
    expect(md).toContain("*love*");
    expect(md).toContain("> amar an elenath");
  });

  it("renders a pronunciation section's IPA entries and text", () => {
    const md = conlangExportToMarkdown(
      baseExport({
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

    expect(md).toContain("/ˈɑ.mɑr/");
    expect(md).toContain("AH-mar");
  });

  it("renders custom_fields as a bulleted key/value list", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "custom_fields",
                order: 0,
                properties: { customFields: { register: "formal" } },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("register");
    expect(md).toContain("formal");
  });

  it("renders tags at the end of a word entry", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [{ text: "verb-root", color: "blue" }],
            lexicalSections: [],
          },
        ],
      }),
    );

    expect(md).toContain("verb-root");
  });

  it("falls back to the default pronunciation header when title is empty, instead of rendering an empty bold marker", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "pronunciation",
                order: 0,
                properties: { title: "", ipaEntries: [{ value: "ˈɑ.mɑr" }] },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**Pronunciation**");
    expect(md).not.toContain("****");
  });

  it("falls back to the default etymology header when title is whitespace-only", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "etymology",
                order: 0,
                properties: { title: "  ", etymologyText: "from Proto-Elvish" },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**Etymology**");
    expect(md).not.toContain("****");
  });

  it("falls back to the default custom_text header when title is empty", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "custom_text",
                order: 0,
                properties: { title: "", contentText: "a note" },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**Notes**");
    expect(md).not.toContain("****");
  });

  it("falls back to the default custom_fields header when title is empty", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "custom_fields",
                order: 0,
                properties: { title: "", customFields: { register: "formal" } },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**Details**");
    expect(md).not.toContain("****");
  });

  it("falls back to the lexical category name when a definition section's title is empty", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        lexicalCategories: [{ localId: 1, category: "noun" }],
        words: [
          {
            text: "amar",
            tags: [],
            lexicalSections: [
              {
                sectionType: "definition",
                order: 0,
                properties: {
                  title: "",
                  lexicalCategoryId: 1,
                  definitionText: "love",
                  examples: [],
                },
              },
            ],
          },
        ],
      }),
    );

    expect(md).toContain("**noun**");
    expect(md).not.toContain("****");
  });

  it("separates multiple words with their own headings", () => {
    const md = conlangExportToMarkdown(
      baseExport({
        words: [
          { text: "amar", tags: [], lexicalSections: [] },
          { text: "mellon", tags: [], lexicalSections: [] },
        ],
      }),
    );

    const amarIndex = md.indexOf("## amar");
    const mellonIndex = md.indexOf("## mellon");
    expect(amarIndex).toBeGreaterThanOrEqual(0);
    expect(mellonIndex).toBeGreaterThan(amarIndex);
  });
});

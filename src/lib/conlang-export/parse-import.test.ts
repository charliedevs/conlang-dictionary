import { describe, expect, it } from "vitest";
import { parseConlangImport } from "./parse-import";

function validExportJson(): string {
  return JSON.stringify({
    formatVersion: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    conlang: { name: "Elvish", description: "A forest tongue" },
    lexicalCategories: [{ localId: 1, category: "noun" }],
    words: [
      {
        text: "amar",
        tags: [],
        lexicalSections: [
          {
            sectionType: "definition",
            order: 0,
            properties: { lexicalCategoryId: 1, definitionText: "love" },
          },
        ],
      },
    ],
  });
}

describe("parseConlangImport", () => {
  it("returns the parsed data and a summary for a valid export file", () => {
    const result = parseConlangImport(validExportJson());

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.data.conlang.name).toBe("Elvish");
    expect(result.summary).toEqual({ wordCount: 1, categoryCount: 1 });
  });

  it("rejects text that isn't valid JSON", () => {
    const result = parseConlangImport("{ not json");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.error).toMatch(/valid json/i);
  });

  it("rejects valid JSON that doesn't match the export schema", () => {
    const result = parseConlangImport(JSON.stringify({ hello: "world" }));

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.error).toMatch(/conlang export/i);
  });

  it("rejects a file from a future, unsupported formatVersion", () => {
    const payload = JSON.parse(validExportJson()) as Record<string, unknown>;
    payload.formatVersion = 2;
    const result = parseConlangImport(JSON.stringify(payload));

    expect(result.ok).toBe(false);
  });

  it("rejects files over the size cap without attempting to parse them", () => {
    const result = parseConlangImport(validExportJson(), 3 * 1024 * 1024);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.error).toMatch(/too large/i);
  });

  it("accepts files at or under the size cap", () => {
    const result = parseConlangImport(validExportJson(), 2 * 1024 * 1024);

    expect(result.ok).toBe(true);
  });
});

import { conlangExportSchema, type ConlangExport } from "~/types/conlang-export";

export const MAX_IMPORT_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export type ImportParseResult =
  | {
      ok: true;
      data: ConlangExport;
      summary: { wordCount: number; categoryCount: number };
    }
  | { ok: false; error: string };

/**
 * Parses and validates an uploaded conlang export file's text content.
 * Pure function — no DOM/File APIs — so the file-reading glue in the
 * import dialog stays a thin, manually-verified wrapper around this.
 */
export function parseConlangImport(
  jsonText: string,
  byteSize?: number,
): ImportParseResult {
  if (byteSize !== undefined && byteSize > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large (max ${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)}MB).`,
    };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  const result = conlangExportSchema.safeParse(parsedJson);
  if (!result.success) {
    return {
      ok: false,
      error: "That file doesn't look like a conlang export.",
    };
  }

  return {
    ok: true,
    data: result.data,
    summary: {
      wordCount: result.data.words.length,
      categoryCount: result.data.lexicalCategories.length,
    },
  };
}

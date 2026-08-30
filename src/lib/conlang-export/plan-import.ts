import { type ConlangExport, type WordTagExport } from "~/types/conlang-export";

/**
 * Determines which tags from a conlang export need to be created — i.e.
 * not already present (by exact text match) among the importing user's
 * existing word tags — deduped across every word in the file. When the
 * same tag text appears more than once with different colors, the first
 * occurrence wins.
 *
 * Pure function: the DB-backed "does this tag already exist" check and
 * the actual insert happen in the caller (server/mutations.ts).
 */
export function planTagsToCreate(
  data: ConlangExport,
  existingTagTexts: ReadonlySet<string>,
): WordTagExport[] {
  const toCreate = new Map<string, WordTagExport["color"]>();
  for (const word of data.words) {
    for (const tag of word.tags) {
      if (existingTagTexts.has(tag.text)) continue;
      if (!toCreate.has(tag.text)) {
        toCreate.set(tag.text, tag.color ?? null);
      }
    }
  }
  return Array.from(toCreate, ([text, color]) => ({ text, color }));
}

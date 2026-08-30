export function conlangExportFilename(
  conlangName: string,
  extension: string,
): string {
  const slug = conlangName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "conlang"}.${extension}`;
}

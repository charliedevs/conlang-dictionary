import {
  type ConlangExport,
  type LexicalSectionExport,
  type WordExport,
} from "~/types/conlang-export";

/**
 * Falls back to a default label when a section's title is empty or
 * whitespace-only, instead of rendering a blank `**title**` (which
 * previously emitted `****`, malformed markdown with no visible header).
 */
function resolveTitle(title: string | undefined, fallback: string): string {
  return title && title.trim() !== "" ? title : fallback;
}

function renderSection(
  section: LexicalSectionExport,
  categoryNamesByLocalId: Map<number, string>,
): string {
  switch (section.sectionType) {
    case "definition": {
      const { properties } = section;
      const categoryName =
        categoryNamesByLocalId.get(properties.lexicalCategoryId) ??
        "unknown category";
      const lines = [`**${resolveTitle(properties.title, categoryName)}**`];
      if (properties.definitionText) lines.push("", properties.definitionText);
      if (properties.examples?.length) {
        lines.push("", ...properties.examples.map((example) => `> ${example}`));
      }
      return lines.join("\n");
    }
    case "pronunciation": {
      const { properties } = section;
      const lines = [`**${resolveTitle(properties.title, "Pronunciation")}**`];
      if (properties.ipaEntries?.length) {
        const entries = properties.ipaEntries
          .map((entry) =>
            entry.label
              ? `${entry.label}: /${entry.value}/`
              : `/${entry.value}/`,
          )
          .join(", ");
        lines.push("", entries);
      }
      if (properties.pronunciationText) {
        lines.push("", properties.pronunciationText);
      }
      return lines.join("\n");
    }
    case "etymology": {
      const { properties } = section;
      const lines = [`**${resolveTitle(properties.title, "Etymology")}**`];
      if (properties.etymologyText) lines.push("", properties.etymologyText);
      return lines.join("\n");
    }
    case "custom_text": {
      const { properties } = section;
      const lines = [`**${resolveTitle(properties.title, "Notes")}**`];
      if (properties.contentText) lines.push("", properties.contentText);
      return lines.join("\n");
    }
    case "custom_fields": {
      const { properties } = section;
      const lines = [`**${resolveTitle(properties.title, "Details")}**`];
      const entries = Object.entries(properties.customFields);
      if (entries.length) {
        lines.push(
          "",
          ...entries.map(([key, value]) => `- **${key}:** ${value}`),
        );
      }
      return lines.join("\n");
    }
  }
}

function renderWord(
  word: WordExport,
  categoryNamesByLocalId: Map<number, string>,
): string {
  const parts = [`## ${word.text}`];
  for (const section of word.lexicalSections) {
    parts.push("", renderSection(section, categoryNamesByLocalId));
  }
  if (word.tags.length) {
    parts.push("", `*Tags: ${word.tags.map((tag) => tag.text).join(", ")}*`);
  }
  return parts.join("\n");
}

export function conlangExportToMarkdown(data: ConlangExport): string {
  const categoryNamesByLocalId = new Map(
    data.lexicalCategories.map((category) => [
      category.localId,
      category.category,
    ]),
  );

  const header = [
    `# ${data.conlang.emoji ? `${data.conlang.emoji} ` : ""}${data.conlang.name}`,
  ];
  if (data.conlang.description) {
    header.push("", data.conlang.description);
  }

  const wordSections = data.words.map((word) =>
    renderWord(word, categoryNamesByLocalId),
  );

  return [header.join("\n"), ...wordSections].join("\n\n");
}

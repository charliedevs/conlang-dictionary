import { type CategorizedWord } from "./membership";

/** A word carrying enough to derive a definition preview — the same minimal
 *  shape as {@link CategorizedWord}, whose definition sections include the
 *  optional `definitionText`. */
export type SnippetWord = CategorizedWord;

/**
 * Reduce a stored definition (Markdown, occasionally with stray HTML) to clean
 * one-line plain text suitable for a preview. This is a lossy best-effort
 * transform for display hints, not a faithful Markdown renderer: it drops
 * formatting markers and structure and keeps the readable words.
 */
export function markdownToPlainText(input: string): string {
  return (
    input
      // images ![alt](url) -> alt, then links [label](url) -> label
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // stray HTML tags
      .replace(/<[^>]+>/g, " ")
      // code fences / inline code backticks (keep the text between)
      .replace(/`+/g, "")
      // emphasis, bold, strikethrough markers
      .replace(/[*_~]+/g, "")
      // leading blockquote / heading / list markers, per line
      .replace(/^[ \t]*(?:>+|#{1,6}|[-*+]|\d+\.)[ \t]+/gm, "")
      // a few common HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#3?9;/g, "'")
      // collapse every run of whitespace (incl. newlines) to a single space
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Truncate to at most `maxLength` characters, preferring a word boundary and
 * appending an ellipsis when the text was actually cut. Trailing punctuation is
 * dropped so the result reads as "the quick brown…", not "the quick brown,…".
 */
export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  let end = maxLength;
  // If the cut lands mid-word, back up to the previous word boundary.
  if (text[end] !== " ") {
    const lastSpace = text.lastIndexOf(" ", end);
    if (lastSpace > 0) end = lastSpace;
  }
  return text.slice(0, end).replace(/[.,;:!?…—-]+$/, "").trimEnd() + "…";
}

/** Definition texts for a word, in-category first, skipping empty ones. */
function definitionTexts(word: SnippetWord, categoryId: number): string[] {
  const inCategory: string[] = [];
  const others: string[] = [];
  for (const section of word.lexicalSections) {
    if (section.sectionType !== "definition") continue;
    const text = section.properties.definitionText;
    if (!text) continue;
    if (section.properties.lexicalCategoryId === categoryId) {
      inCategory.push(text);
    } else {
      others.push(text);
    }
  }
  return [...inCategory, ...others];
}

/**
 * A short, plain-text preview of a word's definition to hint at its meaning in
 * a list. Prefers the definition attached to the category being viewed, then
 * any other definition; returns `undefined` when the word has no definition
 * text to show.
 */
export function definitionSnippet(
  word: SnippetWord,
  categoryId: number,
  maxLength = 90,
): string | undefined {
  for (const raw of definitionTexts(word, categoryId)) {
    const text = markdownToPlainText(raw);
    if (text) return truncateAtWord(text, maxLength);
  }
  return undefined;
}

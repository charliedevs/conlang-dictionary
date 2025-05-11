import { marked } from "marked";
import TurndownService from "turndown";

/**
 * Capitalize the first letter of a string
 * @param str
 * @returns {string}
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false });
}

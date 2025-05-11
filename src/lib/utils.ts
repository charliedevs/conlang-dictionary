import { clsx, type ClassValue } from "clsx";
import sanitizeHtml, { type IOptions } from "sanitize-html";
import { twMerge } from "tailwind-merge";

/**
 * Safely merge class names with tailwind-merge and clsx
 * @param inputs list of class values to merge
 * @example cn("flex flex-col", condition && "gap-4")
 * @returns
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize HTML input with secure defaults, allowing overrides.
 * Use this for all user HTML input before saving or rendering.
 */
export function sanitizeHtmlInput(dirty: string, options?: IOptions): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "p",
      "br",
      "span",
      "div",
      "blockquote",
      "code",
      "pre",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
        },
      }),
    },
    ...options,
  });
}

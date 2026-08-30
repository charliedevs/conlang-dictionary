import { describe, expect, it } from "vitest";
import {
  definitionSnippet,
  markdownToPlainText,
  truncateAtWord,
  type SnippetWord,
} from "./definition-snippet";

describe("markdownToPlainText", () => {
  it("leaves plain prose untouched", () => {
    expect(markdownToPlainText("this is a noun")).toBe("this is a noun");
  });

  it("strips emphasis, bold, and italic markers", () => {
    expect(markdownToPlainText("**bold** and _italic_ and ***both***")).toBe(
      "bold and italic and both",
    );
  });

  it("strips inline code backticks but keeps the code text", () => {
    expect(markdownToPlainText("run `npm test` now")).toBe("run npm test now");
  });

  it("removes ordered and unordered list markers", () => {
    expect(markdownToPlainText("1. new!!!!!!!\n2. this is an ***edit***")).toBe(
      "new!!!!!!! this is an edit",
    );
    expect(markdownToPlainText("- first\n- second")).toBe("first second");
  });

  it("reduces links to their label", () => {
    expect(markdownToPlainText("see [the docs](https://x.com/y)")).toBe(
      "see the docs",
    );
  });

  it("strips headings and blockquotes", () => {
    expect(markdownToPlainText("# Title\n> quoted line")).toBe(
      "Title quoted line",
    );
  });

  it("strips stray HTML tags", () => {
    expect(markdownToPlainText("a <em>word</em> here")).toBe("a word here");
  });

  it("collapses newlines and repeated whitespace into single spaces", () => {
    expect(markdownToPlainText("one\n\n  two\t three")).toBe("one two three");
  });

  it("keeps the leading sentence of a rich multi-line definition", () => {
    const input =
      "A bird of prey of the family Accipitridae.\n\n_A pair of_ **_kites_** _built a nest._\n\n1.  Any bird of the subfamily Milvinae.";
    expect(markdownToPlainText(input)).toBe(
      "A bird of prey of the family Accipitridae. A pair of kites built a nest. Any bird of the subfamily Milvinae.",
    );
  });

  it("is empty for whitespace-only or marker-only input", () => {
    expect(markdownToPlainText("   \n\n  ")).toBe("");
    expect(markdownToPlainText("***")).toBe("");
  });
});

describe("truncateAtWord", () => {
  it("returns short text unchanged", () => {
    expect(truncateAtWord("a short hint", 40)).toBe("a short hint");
  });

  it("cuts at a word boundary and appends an ellipsis", () => {
    expect(truncateAtWord("the quick brown fox jumps over", 15)).toBe(
      "the quick brown…",
    );
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("hello there, friend indeed", 12)).toBe("hello there…");
  });

  it("hard-cuts a single over-long token", () => {
    expect(truncateAtWord("supercalifragilistic", 8)).toBe("supercal…");
  });
});

describe("definitionSnippet", () => {
  function word(
    id: number,
    ...defs: Array<{ cat: number; text?: string }>
  ): SnippetWord {
    return {
      id,
      lexicalSections: defs.map((d) => ({
        sectionType: "definition" as const,
        properties: { lexicalCategoryId: d.cat, definitionText: d.text },
      })),
    };
  }

  it("returns a cleaned snippet from the definition in the viewed category", () => {
    expect(definitionSnippet(word(1, { cat: 2, text: "**a large** feline" }), 2)).toBe(
      "a large feline",
    );
  });

  it("prefers the definition in the viewed category over others", () => {
    const w = word(
      1,
      { cat: 9, text: "unrelated sense" },
      { cat: 2, text: "the sense we want" },
    );
    expect(definitionSnippet(w, 2)).toBe("the sense we want");
  });

  it("falls back to any definition with text when the in-category one is empty", () => {
    const w = word(1, { cat: 2, text: "" }, { cat: 9, text: "some other gloss" });
    expect(definitionSnippet(w, 2)).toBe("some other gloss");
  });

  it("returns undefined when the word has no definition text", () => {
    expect(definitionSnippet(word(1, { cat: 2 }), 2)).toBeUndefined();
    expect(definitionSnippet(word(1), 2)).toBeUndefined();
  });

  it("truncates long definitions", () => {
    const long = "word ".repeat(40).trim();
    const snippet = definitionSnippet(word(1, { cat: 2, text: long }), 2, 30);
    expect(snippet?.endsWith("…")).toBe(true);
    expect(snippet!.length).toBeLessThanOrEqual(31);
  });
});

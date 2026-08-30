import { describe, expect, it } from "vitest";
import { conlangExportFilename } from "./filename";

describe("conlangExportFilename", () => {
  it("slugifies the conlang name and appends the extension", () => {
    expect(conlangExportFilename("High Elvish", "json")).toBe(
      "high-elvish.json",
    );
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(conlangExportFilename("Klêng'än! (draft)", "md")).toBe(
      "kl-ng-n-draft.md",
    );
  });

  it("trims leading/trailing hyphens produced by punctuation at the edges", () => {
    expect(conlangExportFilename("-- Wow --", "json")).toBe("wow.json");
  });

  it("falls back to a generic name when the slug would be empty", () => {
    expect(conlangExportFilename("!!!", "json")).toBe("conlang.json");
  });
});

import { describe, expect, it } from "vitest";
import { feedbackSchema } from "./schema";

describe("feedbackSchema", () => {
  it("accepts a valid bug report with no contact email", () => {
    const result = feedbackSchema.safeParse({
      type: "bug",
      message: "The word list doesn't sort correctly on mobile.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid submission with a contact email", () => {
    const result = feedbackSchema.safeParse({
      type: "idea",
      message: "Add a dark mode toggle to the phonology page.",
      contactEmail: "conlanger@example.com",
    });
    expect(result.success).toBe(true);
  });

  it.each(["bug", "idea", "other"] as const)("accepts type %s", (type) => {
    const result = feedbackSchema.safeParse({
      type,
      message: "Some feedback message.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid type", () => {
    const result = feedbackSchema.safeParse({
      type: "complaint",
      message: "Some feedback message.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = feedbackSchema.safeParse({
      type: "other",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing message", () => {
    const result = feedbackSchema.safeParse({
      type: "other",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the max length", () => {
    const result = feedbackSchema.safeParse({
      type: "other",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a message at the max length", () => {
    const result = feedbackSchema.safeParse({
      type: "other",
      message: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid contact email", () => {
    const result = feedbackSchema.safeParse({
      type: "bug",
      message: "Some feedback message.",
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("treats an empty-string contact email as omitted", () => {
    const result = feedbackSchema.safeParse({
      type: "bug",
      message: "Some feedback message.",
      contactEmail: "",
    });
    expect(result.success).toBe(true);
  });
});

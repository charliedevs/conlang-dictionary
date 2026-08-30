import { describe, expect, it } from "vitest";
import { buildNotificationEmail } from "./build-notification-email";

describe("buildNotificationEmail", () => {
  it("includes the feedback type in the subject", () => {
    const email = buildNotificationEmail({
      type: "bug",
      message: "Something is broken.",
    });
    expect(email.subject).toContain("Bug report");
  });

  it("labels an idea submission distinctly from a bug", () => {
    const bug = buildNotificationEmail({ type: "bug", message: "x" });
    const idea = buildNotificationEmail({ type: "idea", message: "x" });
    expect(idea.subject).not.toBe(bug.subject);
    expect(idea.subject).toContain("Idea");
  });

  it("labels an 'other' submission", () => {
    const email = buildNotificationEmail({ type: "other", message: "x" });
    expect(email.subject).toContain("Other");
  });

  it("includes the message text in the body", () => {
    const email = buildNotificationEmail({
      type: "bug",
      message: "The word list doesn't sort correctly on mobile.",
    });
    expect(email.text).toContain(
      "The word list doesn't sort correctly on mobile.",
    );
  });

  it("includes the contact email in the body when present", () => {
    const email = buildNotificationEmail({
      type: "idea",
      message: "Add dark mode.",
      contactEmail: "conlanger@example.com",
    });
    expect(email.text).toContain("conlanger@example.com");
  });

  it("notes no contact email was provided when omitted", () => {
    const email = buildNotificationEmail({
      type: "idea",
      message: "Add dark mode.",
    });
    expect(email.text.toLowerCase()).toContain("no reply email provided");
  });

  it("notes no contact email was provided when it's an empty string", () => {
    const email = buildNotificationEmail({
      type: "idea",
      message: "Add dark mode.",
      contactEmail: "",
    });
    expect(email.text.toLowerCase()).toContain("no reply email provided");
  });
});

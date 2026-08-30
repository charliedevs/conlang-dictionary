import type { FeedbackInput } from "./schema";

const feedbackTypeLabels: Record<FeedbackInput["type"], string> = {
  bug: "Bug report",
  idea: "Idea",
  other: "Other",
};

export function buildNotificationEmail(input: FeedbackInput) {
  const label = feedbackTypeLabels[input.type];
  const replyTo = input.contactEmail ? input.contactEmail : "No reply email provided.";

  return {
    subject: `Conlang Dictionary feedback: ${label}`,
    text: [
      `Type: ${label}`,
      `Reply-to: ${replyTo}`,
      "",
      input.message,
    ].join("\n"),
  };
}

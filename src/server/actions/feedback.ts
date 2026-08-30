"use server";

import { auth } from "@clerk/nextjs/server";
import { feedbackSchema, type FeedbackInput } from "~/lib/feedback/schema";
import { sendFeedbackNotification } from "../email";
import { insertFeedback } from "../mutations";

export async function submitFeedback(input: FeedbackInput) {
  const parsed = feedbackSchema.parse(input);
  const { userId } = auth();

  const saved = await insertFeedback({
    type: parsed.type,
    message: parsed.message,
    contactEmail: parsed.contactEmail,
    userId,
  });

  try {
    await sendFeedbackNotification(parsed);
  } catch (error) {
    console.error("Feedback email failed to send:", error);
  }

  return { id: saved.id };
}

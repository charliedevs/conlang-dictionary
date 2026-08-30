"use server";

import { auth } from "@clerk/nextjs/server";
import { feedbackSchema, type FeedbackInput } from "~/lib/feedback/schema";
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

  return { id: saved.id };
}

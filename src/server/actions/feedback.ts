"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { feedbackSchema, type FeedbackInput } from "~/lib/feedback/schema";
import { sendFeedbackNotification } from "../email";
import { insertFeedback } from "../mutations";
import { ratelimit } from "../ratelimit";

export interface SubmitFeedbackInput extends FeedbackInput {
  /** Hidden form field real users never fill in; a non-empty value marks the submission as a bot. */
  honeypot?: string;
}

export async function submitFeedback(input: SubmitFeedbackInput) {
  if (input.honeypot) {
    // Report apparent success without touching the DB or sending email, so bots don't learn they were caught.
    return { id: -1 };
  }

  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(`feedback_${ip}`);
  if (!success) {
    throw new Error("Too many submissions. Please try again later.");
  }

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

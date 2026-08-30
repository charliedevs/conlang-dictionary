import "server-only";

import { Resend } from "resend";
import { buildNotificationEmail } from "~/lib/feedback/build-notification-email";
import type { FeedbackInput } from "~/lib/feedback/schema";
import { env } from "~/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Best-effort notification — throws if email isn't configured or the send
 * fails, so the caller can log it without ever blocking the feedback
 * submission itself (the DB row is the durable record).
 */
export async function sendFeedbackNotification(input: FeedbackInput) {
  if (!resend || !env.FEEDBACK_NOTIFY_EMAIL) {
    throw new Error(
      "Feedback email not sent: RESEND_API_KEY or FEEDBACK_NOTIFY_EMAIL is not configured.",
    );
  }

  const { subject, text } = buildNotificationEmail(input);

  const { error } = await resend.emails.send({
    from: "Conlang Dictionary <onboarding@resend.dev>",
    to: env.FEEDBACK_NOTIFY_EMAIL,
    replyTo: input.contactEmail ? input.contactEmail : undefined,
    subject,
    text,
  });

  if (error) throw new Error(error.message);
}

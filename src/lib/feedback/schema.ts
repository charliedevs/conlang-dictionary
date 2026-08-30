import { z } from "zod";

export const feedbackTypes = ["bug", "idea", "other"] as const;

export const feedbackSchema = z.object({
  type: z.enum(feedbackTypes),
  message: z.string().min(1, "Message is required.").max(2000, "Message is too long."),
  contactEmail: z
    .string()
    .email("Enter a valid email or leave it blank.")
    .optional()
    .or(z.literal("")),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

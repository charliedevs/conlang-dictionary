"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { feedbackSchema, type FeedbackInput } from "~/lib/feedback/schema";
import { submitFeedback } from "~/server/actions/feedback";

const HONEYPOT_FIELD_NAME = "website";

const feedbackTypeLabels: Record<FeedbackInput["type"], string> = {
  bug: "Bug report",
  idea: "Idea",
  other: "Other",
};

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "bug",
      message: "",
      contactEmail: "",
    },
  });

  async function onSubmit(values: FeedbackInput) {
    setIsSubmitting(true);
    try {
      await submitFeedback({ ...values, honeypot: honeypotRef.current?.value });
      toast.success("Thanks for the feedback!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:underline hover:opacity-85"
      >
        Send feedback
      </button>
      <DialogDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Send feedback"
        description="Report a bug, share an idea, or just say hi — no account needed."
        content={
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 md:px-2 md:pt-2"
            >
              {/* Honeypot: hidden from real users, but a plain form field a naive bot may fill in. */}
              <div
                aria-hidden="true"
                className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor={HONEYPOT_FIELD_NAME}>Leave this field empty</label>
                <input
                  ref={honeypotRef}
                  id={HONEYPOT_FIELD_NAME}
                  name={HONEYPOT_FIELD_NAME}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(feedbackTypeLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind?"
                        maxLength={2000}
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        maxLength={256}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send feedback"}
              </Button>
            </form>
          </Form>
        }
      />
    </>
  );
}

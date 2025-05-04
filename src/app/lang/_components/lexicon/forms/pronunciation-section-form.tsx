"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OpenPage } from "~/components/icons/open-page";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type Word } from "~/types/word";

const pronunciationFormProps = z
  .object({
    title: z.string().optional(),
    pronunciationText: z.string().optional().default(""),
    ipa: z.string().optional(),
    audioUrl: z.union([
      z.string().trim().url("Invalid URL").optional(),
      z.literal(""),
    ]),
    region: z.string().optional(),
    //phonemeIds: z.string().optional(), // TODO: Integrate later as Phonology is built out
  })
  .superRefine((data, ctx) => {
    if (!data.ipa?.trim() && !data.pronunciationText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either IPA or Pronunciation Text is required.",
        path: ["ipa"],
      });
    }
  });

export type PronunciationSectionFormValues = z.infer<
  typeof pronunciationFormProps
>;

interface PronunciationSectionFormProps {
  word: Word;
  initialValues?: Partial<PronunciationSectionFormValues>;
  mode?: "add" | "edit";
  onSubmit?: (values: PronunciationSectionFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PronunciationSectionForm({
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: PronunciationSectionFormProps) {
  const form = useForm<PronunciationSectionFormValues>({
    resolver: zodResolver(pronunciationFormProps),
    defaultValues: {
      title: initialValues.title ?? "Pronunciation",
      pronunciationText: initialValues.pronunciationText ?? "",
      ipa: initialValues.ipa ?? "",
      audioUrl: initialValues.audioUrl ?? "",
      region: initialValues.region ?? "",
    },
  });

  function handleSubmit(values: PronunciationSectionFormValues) {
    onSubmit?.(values);
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        aria-disabled={disabled}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Pronunciation"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ipa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IPA</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. /ˈmaʊn.tɪn/"
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription className="group/link">
                <a
                  href="https://ipa.typeit.org/full/"
                  target="_blank"
                  className="flex items-center justify-end gap-1 text-xs text-blue-600 underline group-hover/link:text-blue-500"
                >
                  Get IPA symbols
                  <OpenPage className="h-3 w-3 text-primary opacity-70 group-hover/link:opacity-100" />
                </a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pronunciationText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pronunciation Text</FormLabel>
              <FormControl>
                <TextEditor
                  {...field}
                  value={field.value}
                  className="min-h-[80px] bg-background"
                  showOrderedList
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="audioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audio URL (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="url"
                  placeholder="Paste audio file URL"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting || disabled}
          >
            {mode === "edit" ? "Save Changes" : "Add Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

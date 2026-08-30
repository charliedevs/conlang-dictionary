"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
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
  SECTION_RICH_TEXT_MAX_LENGTH,
  SECTION_TITLE_MAX_LENGTH,
} from "~/lib/form-limits";
import { htmlToMarkdown } from "~/lib/strings";
import { sanitizeHtmlInput } from "~/lib/utils";
import { type Word } from "~/types/word";

const etymologyFormProps = z.object({
  title: z
    .string()
    .max(
      SECTION_TITLE_MAX_LENGTH,
      `Title must be ${SECTION_TITLE_MAX_LENGTH} characters or fewer.`,
    )
    .optional(),
  etymologyText: z
    .string()
    .default("")
    .refine((val) => val !== "", "Text required"),
});

export type EtymologySectionFormValues = z.infer<typeof etymologyFormProps>;

interface EtymologySectionFormProps {
  word: Word;
  initialValues?: Partial<EtymologySectionFormValues>;
  mode?: "add" | "edit";
  onSubmit?: (values: EtymologySectionFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function EtymologySectionForm({
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: EtymologySectionFormProps) {
  const form = useForm<EtymologySectionFormValues>({
    resolver: zodResolver(etymologyFormProps),
    defaultValues: {
      title: initialValues.title ?? "",
      etymologyText: initialValues.etymologyText ?? "",
    },
  });

  function handleSubmit(values: EtymologySectionFormValues) {
    onSubmit?.({
      ...values,
      etymologyText: htmlToMarkdown(sanitizeHtmlInput(values.etymologyText)),
    });
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
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
                  placeholder="e.g. Etymology"
                  maxLength={SECTION_TITLE_MAX_LENGTH}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="etymologyText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etymology Text</FormLabel>
              <FormControl>
                <TextEditor
                  {...field}
                  value={field.value}
                  className="min-h-[80px] bg-background"
                  showOrderedList
                  maxLength={SECTION_RICH_TEXT_MAX_LENGTH}
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

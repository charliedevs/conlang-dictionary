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
import { type Word } from "~/types/word";

const customTextFormProps = z.object({
  title: z.string().refine((val) => val !== "", "Title cannot be empty"),
  contentText: z
    .string()
    .default("")
    .refine((val) => val !== "", "Text required"),
});

export type CustomTextSectionFormValues = z.infer<typeof customTextFormProps>;

interface CustomTextSectionFormProps {
  word: Word;
  initialValues?: Partial<CustomTextSectionFormValues>;
  mode?: "add" | "edit";
  onSubmit?: (values: CustomTextSectionFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function CustomTextSectionForm({
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: CustomTextSectionFormProps) {
  const form = useForm<CustomTextSectionFormValues>({
    resolver: zodResolver(customTextFormProps),
    defaultValues: {
      title: initialValues.title ?? "",
      contentText: initialValues.contentText ?? "",
    },
  });

  function handleSubmit(values: CustomTextSectionFormValues) {
    onSubmit?.(values);
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
              <FormLabel>Section Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Notes, Usage, etc."
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contentText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Content</FormLabel>
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

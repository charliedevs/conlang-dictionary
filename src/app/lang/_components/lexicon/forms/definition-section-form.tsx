"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { useLexicalCategories } from "~/hooks/data/useLexicalCategories";
import {
  EXAMPLE_SENTENCE_MAX_LENGTH,
  SECTION_RICH_TEXT_MAX_LENGTH,
  SECTION_TITLE_MAX_LENGTH,
} from "~/lib/form-limits";
import { htmlToMarkdown } from "~/lib/strings";
import { sanitizeHtmlInput } from "~/lib/utils";
import { type LexicalCategory, type Word } from "~/types/word";
import { LexicalCategorySelect } from "./lexical-category-select";

export const definitionProps = z.object({
  title: z.string().max(SECTION_TITLE_MAX_LENGTH).optional(),
  lexicalCategoryId: z.coerce.number({ invalid_type_error: "Required" }),
  definitionText: z
    .string()
    .refine((val) => val !== "", "Definition cannot be empty"),
  examples: z
    .array(z.object({ value: z.string().max(EXAMPLE_SENTENCE_MAX_LENGTH) }))
    .optional(),
});

export type DefinitionSectionProperties = z.infer<typeof definitionProps>;

interface DefinitionSectionFormProps {
  word: Word;
  initialValues?: Partial<
    Omit<DefinitionSectionProperties, "examples"> & { examples?: string[] }
  >;
  mode?: "add" | "edit";
  onSubmit?: (
    values: Omit<DefinitionSectionProperties, "examples"> & {
      examples?: string[];
    },
  ) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function DefinitionSectionForm({
  word,
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: DefinitionSectionFormProps) {
  // Map initial string[] to { value: string }[]
  const initialExamples = (initialValues.examples ?? []).map((ex) => ({
    value: ex,
  }));
  const form = useForm<DefinitionSectionProperties>({
    resolver: zodResolver(definitionProps),
    defaultValues: {
      title: initialValues.title ?? "",
      lexicalCategoryId: initialValues.lexicalCategoryId ?? undefined,
      definitionText: initialValues.definitionText ?? "",
      examples: initialExamples,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "examples",
  });
  const [newExample, setNewExample] = useState("");
  const { lexicalCategories } = useLexicalCategories(word.conlangId);
  const queryClient = useQueryClient();

  function handleAddExample() {
    if (newExample.trim() && fields.length < 10) {
      append({ value: newExample.trim() });
      setNewExample("");
    }
  }

  function handleSubmit(values: DefinitionSectionProperties) {
    // Map { value: string }[] to string[]
    const sanitizedHtml = sanitizeHtmlInput(values.definitionText);
    const markdown = htmlToMarkdown(sanitizedHtml);
    const mapped = {
      ...values,
      definitionText: markdown,
      examples: values.examples?.map((ex) => ex.value).filter(Boolean),
    };
    onSubmit?.(mapped);
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="lexicalCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part of Speech</FormLabel>
              <FormControl>
                <LexicalCategorySelect
                  conlangId={word.conlangId}
                  value={field.value}
                  onChange={(val) => {
                    const oldCategoryID = form.getValues("lexicalCategoryId");
                    const newCategoryID = Number(val);
                    // Read the freshest list from the cache: a just-added
                    // category isn't in this render's snapshot yet, which would
                    // otherwise leave the autofilled title blank.
                    const categories =
                      queryClient.getQueryData<LexicalCategory[]>([
                        "lexicalCategories",
                        word.conlangId,
                      ]) ??
                      lexicalCategories.data ??
                      [];
                    const oldCategory =
                      categories.find((c) => c.id === oldCategoryID)?.category ??
                      "";
                    const newCategory =
                      categories.find((c) => c.id === newCategoryID)?.category ??
                      "";
                    const currentTitle = form.getValues("title");

                    if (!currentTitle || currentTitle == oldCategory) {
                      form.setValue("title", newCategory);
                    }
                    field.onChange(Number(val));
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="definitionText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition Text</FormLabel>
              <FormControl>
                <TextEditor
                  {...field}
                  className="min-h-[80px] bg-background md:max-h-[400px]"
                  showOrderedList
                  maxLength={SECTION_RICH_TEXT_MAX_LENGTH}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="examples"
          render={() => (
            <fieldset className="flex flex-col gap-2 rounded-md border border-muted bg-muted/40 p-2">
              <legend className="mb-2 px-1 text-sm font-semibold text-muted-foreground">
                Examples (optional)
              </legend>
              <div className="mb-2 flex gap-2">
                <Input
                  placeholder="Add example sentence"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExample();
                    }
                  }}
                  maxLength={EXAMPLE_SENTENCE_MAX_LENGTH}
                  disabled={disabled || fields.length >= 10}
                  className="font-unicode"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!newExample || disabled || fields.length >= 10}
                  onClick={handleAddExample}
                >
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5">
                {fields.map((field, idx) => (
                  <li key={field.id} className="mb-2 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`examples.${idx}.value` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={EXAMPLE_SENTENCE_MAX_LENGTH}
                              disabled={disabled}
                              className="font-unicode"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(idx)}
                      disabled={disabled}
                    >
                      <XIcon />
                    </Button>
                  </li>
                ))}
              </ul>
              <FormMessage />
            </fieldset>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Defaults to the part of speech"
                  maxLength={SECTION_TITLE_MAX_LENGTH}
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { type Word } from "~/types/word";
import { LexicalCategorySelect } from "./lexical-category-select";

// Zod schema for definition section properties
export const definitionProps = z.object({
  title: z.string().optional(),
  lexicalCategoryId: z.coerce.number({ invalid_type_error: "Required" }),
  definitionText: z.string(),
  examples: z.array(z.object({ value: z.string() })).optional(),
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
}

export function DefinitionSectionForm({
  word,
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
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

  function handleAddExample() {
    if (newExample.trim()) {
      append({ value: newExample.trim() });
      setNewExample("");
    }
  }

  function handleSubmit(values: DefinitionSectionProperties) {
    // Map { value: string }[] to string[]
    const mapped = {
      ...values,
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Title (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Noun, Verb, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                    const oldCategory =
                      lexicalCategories.data?.find(
                        (c) => c.id === oldCategoryID,
                      )?.category ?? "";
                    const newCategory =
                      lexicalCategories.data?.find(
                        (c) => c.id === newCategoryID,
                      )?.category ?? "";
                    const currentTitle = form.getValues("title");

                    if (!currentTitle || currentTitle == oldCategory) {
                      form.setValue("title", newCategory);
                    }
                    field.onChange(Number(val));
                  }}
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
                  //value={field.value ?? ""}
                  //onChange={field.onChange}
                  className="min-h-[80px] bg-background"
                  showOrderedList
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
            <FormItem>
              <FormLabel>Examples</FormLabel>
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
                />
                <Button type="button" onClick={handleAddExample}>
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5">
                {fields.map((field, idx) => (
                  <li key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`examples.${idx}.value` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(idx)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting}
          >
            {mode === "edit" ? "Save Changes" : "Add Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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

const customFieldSchema = z.object({
  key: z.string().min(1, "Key required"),
  value: z.string(),
});

const customFieldsSectionProps = z.object({
  title: z.string().optional(),
  customFields: z.array(customFieldSchema),
});

export type CustomFieldsSectionFormValues = z.infer<
  typeof customFieldsSectionProps
>;

interface CustomFieldsSectionFormProps {
  word: Word;
  initialValues?: Partial<CustomFieldsSectionFormValues>;
  mode?: "add" | "edit";
  onSubmit?: (values: CustomFieldsSectionFormValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function CustomFieldsSectionForm({
  word,
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
  disabled = false,
}: CustomFieldsSectionFormProps) {
  const form = useForm<CustomFieldsSectionFormValues>({
    resolver: zodResolver(customFieldsSectionProps),
    defaultValues: {
      title: initialValues.title ?? "",
      customFields: initialValues.customFields ?? [{ key: "", value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  });
  const [keySuggestions, setKeySuggestions] = useState<string[]>([]);

  useEffect(() => {
    void fetch(`/api/custom-field-keys?conlangId=${word.conlangId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setKeySuggestions(data);
      });
  }, [word.conlangId]);

  function handleSubmit(values: CustomFieldsSectionFormValues) {
    const customFields: Record<string, string> = {};
    values.customFields.forEach((f) => {
      if (f.key) customFields[f.key] = f.value;
    });
    onSubmit?.({
      title: values.title,
      customFields: Object.entries(customFields).map(([key, value]) => ({
        key,
        value,
      })),
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
                  placeholder="e.g. Extra Info"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name={`customFields.${idx}.key` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        list={`key-suggestions-${idx}`}
                        placeholder="Field name"
                        disabled={disabled}
                      />
                    </FormControl>
                    <datalist id={`key-suggestions-${idx}`}>
                      {keySuggestions.map((k) => (
                        <option key={k} value={k} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`customFields.${idx}.value` as const}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(idx)}
                disabled={disabled || fields.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ key: "", value: "" })}
            disabled={disabled}
          >
            Add Field
          </Button>
        </div>
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

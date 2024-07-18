"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { createSection } from "../../_actions/word";
import { LexicalCategorySelect } from "../lexical-category-select";

const newDefinitionSectionSchema = z.object({
  lexicalCategoryId: z.number(),
  wordId: z.number(),
  type: z.enum(["definition"]),
});

export const NewDefinitionSectionForm = (props: {
  conlangId: number;
  wordId: number;
  afterSubmit?: () => void;
}) => {
  const form = useForm<z.infer<typeof newDefinitionSectionSchema>>({
    resolver: zodResolver(newDefinitionSectionSchema),
    defaultValues: {
      lexicalCategoryId: undefined,
      wordId: props.wordId,
      type: "definition",
    },
  });

  const router = useRouter();
  const handleSave = async (
    data: z.infer<typeof newDefinitionSectionSchema>,
  ) => {
    try {
      await createSection(data);
      props.afterSubmit?.();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add section. Please try again.");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="flex flex-col justify-center gap-2"
      >
        <FormField
          control={form.control}
          name="lexicalCategoryId"
          render={({ field }) => (
            <FormItem className="">
              <FormControl>
                <LexicalCategorySelect
                  {...field}
                  onChange={(val) => field.onChange(Number(val))}
                  conlangId={props.conlangId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          Add Definition Section
        </Button>
      </form>
    </Form>
  );
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CornerDownLeftIcon, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { WORD_TEXT_MAX_LENGTH } from "~/lib/form-limits";
import { createWord } from "../../../_actions/word";

const newWordSchema = z.object({
  conlangId: z.number(),
  text: z
    .string()
    .min(1, "Word text required.")
    .max(
      WORD_TEXT_MAX_LENGTH,
      `Word text must be ${WORD_TEXT_MAX_LENGTH} characters or fewer.`,
    ),
});

export const AddWordForm = (props: {
  conlangId: number;
  afterSubmit?: (newWordId: number) => void;
}) => {
  const form = useForm<z.infer<typeof newWordSchema>>({
    resolver: zodResolver(newWordSchema),
    defaultValues: {
      conlangId: props.conlangId,
      text: "",
    },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof newWordSchema>) {
    try {
      const word = await createWord(values);
      props.afterSubmit?.(word.id);
      form.reset();
      router.refresh();
      toast.success(`Word "${word.text}" added.`);
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add word. Please try again.");
      }
      return;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-start gap-1 md:w-auto"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1 md:flex-initial">
              <FormControl>
                <Input
                  placeholder="Add new word..."
                  endAdornment={
                    <CornerDownLeftIcon className="relative -right-3 size-4 opacity-50" />
                  }
                  maxLength={WORD_TEXT_MAX_LENGTH}
                  {...field}
                  className="font-unicode"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="ml-1 flex h-10 shrink-0 items-center gap-1"
        >
          <PlusIcon className="size-4" /> Add
        </Button>
      </form>
    </Form>
  );
};

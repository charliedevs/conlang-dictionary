"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CornerDownLeftIcon, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createWord } from "../../../_actions/word";

const newWordSchema = z.object({
  conlangId: z.number(),
  text: z.string().min(1, "Word text required."),
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
        className="flex items-center gap-1"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="">
              <FormControl>
                <Input
                  placeholder="Add new word..."
                  endAdornment={
                    <CornerDownLeftIcon className="relative -right-3 size-4 opacity-50" />
                  }
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="not-sr-only ml-1 flex h-10 items-center gap-1 md:sr-only"
        >
          <PlusIcon className="size-4" /> Add
        </Button>
      </form>
    </Form>
  );
};

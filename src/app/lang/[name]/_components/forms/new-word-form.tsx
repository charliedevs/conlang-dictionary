"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import { createWord } from "../../_actions/word";

const newWordSchema = z.object({
  conlangId: z.number(),
  text: z.string().min(1, "Word text required."),
  pronunciation: z.string().optional(),
  gloss: z.string().optional(),
  definition: z.string().optional(),
});

export const NewWordForm = (props: {
  conlangId: number;
  afterSubmit?: () => void;
}) => {
  const form = useForm<z.infer<typeof newWordSchema>>({
    resolver: zodResolver(newWordSchema),
    defaultValues: {
      conlangId: props.conlangId,
      text: "",
      pronunciation: "",
      definition: "",
    },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof newWordSchema>) {
    try {
      await createWord(values);
      props.afterSubmit?.();
      router.refresh();
      toast.success("Word added.");
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
    <ScrollArea
      id="newWordForm"
      className="min-h-0 min-w-64 flex-grow overflow-auto rounded-md px-2 [&>div]:max-h-[calc(95vh)]"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-center gap-4 px-4"
        >
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Word</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pronunciation"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Pronunciation</FormLabel>
                <FormControl>
                  <Input placeholder="IPA (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gloss"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Gloss</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., BOOK (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="definition"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Definition</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add as much info as you want (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Add Word
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

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
import { Textarea } from "~/components/ui/textarea";
import { handleApiErrorResponse } from "~/utils/client-error-handler";

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
  function onSubmit(values: z.infer<typeof newWordSchema>) {
    fetch("/api/word", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) {
          return handleApiErrorResponse(res);
        }
        return res.json();
      })
      .then(() => {
        props.afterSubmit?.();
        form.reset();
        router.refresh();
        toast.success("Word added.");
      })
      .catch((err) => {
        console.error("Error:", err);
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Failed to add word. Please try again.");
        }
      });
  }

  return (
    <div id="newWordForm">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-w-64 flex-col justify-center space-y-4 px-4"
        >
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Word</FormLabel>
                <FormControl>
                  <Input placeholder="teng" {...field} />
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
                  <Input placeholder="tʃiːn" {...field} />
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
                  <Input placeholder="BOOK" {...field} />
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
                  <Textarea placeholder="book; a written work" {...field} />
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
    </div>
  );
};

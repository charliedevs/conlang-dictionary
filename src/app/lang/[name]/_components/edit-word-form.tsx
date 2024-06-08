import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { type Word } from "~/types/word";
import { updateWord } from "../_actions/word";

const editWordSchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Word text required."),
  pronunciation: z.string().optional(),
  gloss: z.string().optional(),
  definition: z.string().optional(),
});

interface EditWordFormProps {
  word: Word;
  afterSubmit?: () => void;
}

export function EditWordForm(props: EditWordFormProps) {
  const defaultValues = {
    id: props.word.id,
    text: props.word.text,
    pronunciation: props.word.pronunciation ?? "",
    definition: props.word.definition ?? "",
  };
  const form = useForm<z.infer<typeof editWordSchema>>({
    resolver: zodResolver(editWordSchema),
    defaultValues: { ...defaultValues },
  });
  useEffect(() => {
    form.reset({ ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.word.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  async function onSubmit(values: z.infer<typeof editWordSchema>) {
    setIsSubmitting(true);
    try {
      await updateWord(values);
      props.afterSubmit?.();
      router.refresh();
      toast.success("Word updated.");
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update word. Please try again.");
      }
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="editWordForm">
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
                  <Input placeholder="e.g.,BOOK (optional)" {...field} />
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
          <Button type="submit" disabled={isSubmitting}>
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}

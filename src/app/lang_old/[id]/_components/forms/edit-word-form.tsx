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
import { ScrollArea } from "~/components/ui/scroll-area";
import { type Word } from "~/types/word";
import { updateWord } from "../../_actions/word";

const editWordSchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Word text required."),
});

interface EditWordFormProps {
  word: Word;
  afterSubmit?: () => void;
}

export function EditWordForm(props: EditWordFormProps) {
  const defaultValues = {
    id: props.word.id,
    text: props.word.text,
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
    <ScrollArea
      id="editWordForm"
      className="min-h-0 min-w-64 flex-grow overflow-auto rounded-md px-2 [&>div]:max-h-[calc(95vh)]"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-center gap-5 px-2 md:gap-4 md:px-4"
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
          <Button type="submit" disabled={isSubmitting}>
            Update
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={props.afterSubmit}
          >
            Cancel
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
}

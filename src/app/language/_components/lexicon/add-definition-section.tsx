import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type Word } from "~/types/word";
import { createDefinitionSection } from "../../_actions/word";

const newDefinitionSectionSchema = z.object({
  wordId: z.number(),
  title: z.string(),
  lexicalCategoryId: z.number(),
  text: z.string().min(1, "Definition text required."),
});

export const AddDefinitionSectionForm = (props: {
  word: Word;
  afterSubmit?: () => void;
}) => {
  const form = useForm<z.infer<typeof newDefinitionSectionSchema>>({
    resolver: zodResolver(newDefinitionSectionSchema),
    defaultValues: {
      wordId: props.word.id,
      title: undefined,
      lexicalCategoryId: undefined,
      text: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof newDefinitionSectionSchema>) {
    try {
      await createDefinitionSection(values);
      props.afterSubmit?.();
      form.reset();
      toast.success("Definition section added.");
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add definition section. Please try again.");
      }
      return;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-1"
      >
        <FormField
          control={form.control}
          name="lexicalCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Choose part of speech..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormDescription>
                Add first definition (others may be added later):
              </FormDescription>
              <FormControl>
                <TextEditor
                  value={field.value}
                  onChange={field.onChange}
                  className="bg-background"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-2"
        >
          Save
        </Button>
      </form>
    </Form>
  );
};

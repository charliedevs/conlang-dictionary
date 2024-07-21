"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CornerDownLeftIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createWord } from "../../_actions/word";

const newWordSchema = z.object({
  conlangId: z.number(),
  text: z.string().min(1, "Word text required."),
});

export const AddWordForm = (props: {
  conlangId: number;
  afterSubmit?: () => void;
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
      await createWord(values);
      props.afterSubmit?.();
      form.reset();
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-2 mt-1.5 flex items-center gap-1"
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

        {/* <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          size="icon"
          variant="ghost"
        >
          <PlusIcon className="size-5" />
        </Button> */}
      </form>
    </Form>
  );
};

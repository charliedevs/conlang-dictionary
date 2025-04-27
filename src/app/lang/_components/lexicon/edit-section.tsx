"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Edit2Icon, SaveIcon, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type WordSection } from "~/types/word";
import { editWordSection } from "../../_actions/word";

export const EditSectionButton = (props: { onClick: () => void }) => {
  return (
    <Button
      onClick={props.onClick}
      variant="ghost"
      size="sm"
      className="size-6 p-1 transition-all md:opacity-0 md:group-hover/section:opacity-100"
      title="Edit Section"
    >
      <Edit2Icon className="size-5" />
    </Button>
  );
};

const editSectionSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Section title required."),
});

export const EditSectionForm = (props: {
  section: WordSection;
  afterSubmit?: () => void;
  onCancel?: () => void;
}) => {
  const form = useForm<z.infer<typeof editSectionSchema>>({
    resolver: zodResolver(editSectionSchema),
    defaultValues: {
      id: props.section.id,
      title: props.section.title ?? "",
    },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof editSectionSchema>) {
    try {
      await editWordSection(values);
      props.afterSubmit?.();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to edit section. Please try again.");
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} className="text-lg" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          variant="ghost"
          size="sm"
          className="size-10 p-1 text-blue-500 transition-all hover:bg-blue-500/10 hover:text-blue-600"
          title="Save"
        >
          <SaveIcon className="size-5" />
        </Button>
        {props.onCancel && (
          <Button
            onClick={props.onCancel}
            variant="ghost"
            size="sm"
            className="size-10 p-1 text-muted-foreground transition-all"
            title="Cancel"
          >
            <XIcon className="size-5" />
          </Button>
        )}
      </form>
    </Form>
  );
};

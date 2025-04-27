import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Edit2Icon, SaveIcon, XIcon } from "lucide-react";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { type Definition } from "~/types/word";
import { editDefinition } from "../../_actions/word";

export const EditDefinitionButton = (props: { onClick: () => void }) => {
  return (
    <Button
      onClick={props.onClick}
      variant="ghost"
      size="sm"
      className="size-6 p-1 transition-all md:opacity-0 md:group-hover/definition:opacity-100"
      title="Edit Definition"
    >
      <Edit2Icon className="size-5" />
    </Button>
  );
};

const editDefinitionSchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Definition text required."),
});

export const EditDefinitionForm = (props: {
  definition: Definition;
  afterSubmit?: () => void;
  onCancel?: () => void;
}) => {
  const form = useForm<z.infer<typeof editDefinitionSchema>>({
    resolver: zodResolver(editDefinitionSchema),
    defaultValues: {
      id: props.definition.id,
      text: props.definition.text,
    },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof editDefinitionSchema>) {
    try {
      await editDefinition(values);
      props.afterSubmit?.();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to edit definition. Please try again.");
      }
      return;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextEditor
                  {...field}
                  className="min-h-[30px]"
                  customToolbarActions={
                    <>
                      {props.onCancel && (
                        <Button
                          onClick={props.onCancel}
                          disabled={form.formState.isSubmitting}
                          variant="outline"
                          size="sm"
                          title="Cancel"
                          className="h-9 bg-transparent px-2.5 ring-offset-background transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <XIcon className="size-4" />
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        variant="outline"
                        size="sm"
                        title="Save"
                        className="h-9 bg-transparent px-2.5 text-blue-700 ring-offset-background transition-colors hover:bg-blue-700/10 hover:text-blue-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <SaveIcon className="size-4" />
                      </Button>
                    </>
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

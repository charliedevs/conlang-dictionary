import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { addDefinition } from "../../_actions/word";

export const AddDefinitionButton = (props: { onClick: () => void }) => {
  return (
    <Button
      onClick={props.onClick}
      variant="ghost"
      className="transition-all md:h-8  md:opacity-0 md:group-hover/section:opacity-100"
    >
      <PlusIcon className="mr-1 size-4 text-green-600" />
      Add Definition
    </Button>
  );
};

const addDefinitionSchema = z.object({
  definitionSectionId: z.number(),
  text: z.string().min(1, "Definition text required."),
});

export const AddDefinitionForm = (props: {
  definitionSectionId: number;
  afterSubmit?: () => void;
  onCancel?: () => void;
}) => {
  const form = useForm<z.infer<typeof addDefinitionSchema>>({
    resolver: zodResolver(addDefinitionSchema),
    defaultValues: { definitionSectionId: props.definitionSectionId, text: "" },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof addDefinitionSchema>) {
    try {
      await addDefinition(values);
      props.afterSubmit?.();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add definition. Please try again.");
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

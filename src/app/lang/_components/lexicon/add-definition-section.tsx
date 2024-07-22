import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PlusCircle } from "~/components/icons/plus-circle";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useLexicalCategories } from "~/hooks/data/useLexicalCategories";
import { type Word } from "~/types/word";
import { createDefinitionSection } from "../../_actions/word";

//TODO: GET NAME OUT OF LEXICAL CATEGORY SELECT FOR SECTION TITLE
export function LexicalCategorySelect(props: {
  conlangId: number;
  defaultValue?: number | null;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { lexicalCategories, addLexicalCategory } = useLexicalCategories(
    props.conlangId,
  );

  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState("");

  const router = useRouter();
  const handleSave = async () => {
    try {
      setIsAdding(false);
      await addLexicalCategory.mutateAsync({
        conlangId: props.conlangId,
        category,
      });
      toast.success(`${category} added.`);
      setCategory("");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add part of speech. Please try again.");
      }
    }
  };

  return (
    <>
      <Select
        onValueChange={props.onChange}
        defaultValue={props.defaultValue ? String(props.defaultValue) : ""}
      >
        <SelectTrigger className={props.className}>
          <SelectValue placeholder="Choose part of speech..." />
        </SelectTrigger>
        <SelectContent>
          {lexicalCategories.data ? (
            <>
              {lexicalCategories.data.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.category}
                </SelectItem>
              ))}
            </>
          ) : null}
          <div className="relative mt-1 flex w-full flex-col items-center gap-1 text-sm outline-none">
            {(addLexicalCategory.isPending || lexicalCategories.isLoading) && (
              <div className="animate-pulse">Loading...</div>
            )}
            <Button
              onClick={() => setIsAdding(true)}
              variant="ghost"
              size="sm"
              className="w-full rounded-sm"
            >
              <PlusCircle className="mr-2 size-5 text-inherit" />
              Add New Part of Speech
            </Button>
          </div>
        </SelectContent>
      </Select>
      <DialogDrawer
        open={isAdding}
        onClose={() => {
          setIsAdding(false);
          props.onChange("");
        }}
        title="Add Part of Speech"
        content={
          <>
            <Input
              placeholder="New part of speech..."
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && category) {
                  await handleSave();
                }
              }}
              className="min-w-44"
            />
            <Button disabled={!category} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      />
    </>
  );
}

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
  const { lexicalCategories } = useLexicalCategories(props.word.conlangId);
  const form = useForm<z.infer<typeof newDefinitionSectionSchema>>({
    resolver: zodResolver(newDefinitionSectionSchema),
    defaultValues: {
      wordId: props.word.id,
      title: "test",
      lexicalCategoryId: undefined,
      text: undefined,
    },
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof newDefinitionSectionSchema>) {
    try {
      await createDefinitionSection(values);
      props.afterSubmit?.();
      form.reset();
      router.refresh();
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
                <LexicalCategorySelect
                  {...field}
                  conlangId={props.word.conlangId}
                  onChange={(val) => {
                    form.setValue(
                      "title",
                      lexicalCategories.data?.find((c) => c.id === Number(val))
                        ?.category ?? "",
                    );
                    field.onChange(Number(val));
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormDescription className="text-xs">
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

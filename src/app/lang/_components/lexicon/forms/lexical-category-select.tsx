import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "~/components/icons/plus-circle";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useLexicalCategories } from "~/hooks/data/useLexicalCategories";

export interface LexicalCategorySelectProps {
  conlangId: number;
  value?: string | number | null;
  onChange: (value: string) => void;
  className?: string;
}

export const LexicalCategorySelect = forwardRef<
  HTMLButtonElement,
  LexicalCategorySelectProps
>((props, ref) => {
  const { lexicalCategories, addLexicalCategory } = useLexicalCategories(
    props.conlangId,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    try {
      setIsAdding(false);
      const response = await addLexicalCategory.mutateAsync({
        conlangId: props.conlangId,
        category: newCategory,
      });
      toast.success(`${response.category} added.`);
      props.onChange(response.id.toString());
      setNewCategory("");
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
        value={props.value ? String(props.value) : ""}
        onValueChange={props.onChange}
      >
        <SelectTrigger className={props.className} ref={ref}>
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
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && newCategory) {
                  await handleSave();
                }
              }}
              className="min-w-44"
            />
            <Button disabled={!newCategory} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      />
    </>
  );
});

LexicalCategorySelect.displayName = "LexicalCategorySelect";

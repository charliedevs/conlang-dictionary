import { useRouter } from "next/navigation";
import { useState } from "react";
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
          <SelectValue placeholder="Part of speech..." />
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

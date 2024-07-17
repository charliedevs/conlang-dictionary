"use client";

import { PlusCircleIcon, SaveIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createLexicalCategory } from "../../_actions/word";

export function AddLexicalCategoryButton(props: { conlangId: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState("");

  const router = useRouter();
  const handleSave = async () => {
    try {
      await createLexicalCategory({ conlangId: props.conlangId, category });
      setIsAdding(false);
      toast.success(`${category} added.`);
      setCategory("");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add lexical category. Please try again.");
      }
      return;
    }
  };

  return !isAdding ? (
    <Button onClick={() => setIsAdding(true)} variant="outline">
      <PlusCircleIcon className="mr-1 size-4 text-inherit" />
      Add New Part of Speech
    </Button>
  ) : (
    <div className="flex items-center gap-1">
      <Input
        placeholder="New part of speech..."
        onChange={(e) => setCategory(e.target.value)}
      />
      <Button
        onClick={handleSave}
        variant="outline"
        size="sm"
        className="h-10 text-blue-700 hover:bg-blue-700/10 hover:text-blue-700/80"
      >
        <SaveIcon className="size-4" />
      </Button>
      <Button
        onClick={() => setIsAdding(false)}
        variant="outline"
        size="sm"
        className="h-10"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}

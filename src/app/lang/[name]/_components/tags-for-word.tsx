"use client";

import { Plus, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { type Tag } from "~/types/tag";
import { type Word } from "~/types/word";
import { addTagToWord } from "../_actions/tag";

async function getUserTags() {
  try {
    (await fetch("/api/tags?tagType=word&isForUser=true", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())) as Promise<Tag[]>;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// TODO: show popover onclick to enter new tag with list of existing tags
function AddTagButton(props: {
  wordId: number;
  conlangName: string;
  className?: string;
}) {
  const router = useRouter();
  async function handleAddTag() {
    try {
      await addTagToWord(props.wordId, "flowing");
      router.refresh();
    } catch (error) {
      // check if it's a unique constraint error
      if (error instanceof Error && error.message.includes("unique")) {
        toast.error("Tag already exists");
      } else {
        toast.error("Failed to add tag");
      }
      console.error("Error:", error);
    }
  }
  return (
    <div className={props.className}>
      <Button
        onClick={handleAddTag}
        variant="outline"
        size="sm"
        className="group/addTag flex h-6 items-center gap-1 px-1 text-muted-foreground"
      >
        <Plus className="size-[14px]" />
        <p className="sr-only text-xs font-semibold tracking-tighter group-hover/addTag:not-sr-only">
          Add Tag
        </p>
      </Button>
    </div>
  );
}

export function TagsForWord(props: { word: Word; conlangName: string }) {
  return (
    <div
      id="tagsForWord"
      className="group/tags flex min-h-8 items-center gap-2"
    >
      <TagIcon className="size-5 rotate-[135deg] text-muted-foreground" />
      {props.word.tags.map((tag) => (
        <Button
          key={tag.id}
          variant="ghost"
          size="sm"
          className="flex h-6 items-center gap-1 px-1 text-muted-foreground"
        >
          {tag.text}
        </Button>
      ))}
      <AddTagButton
        wordId={props.word.id}
        conlangName={props.conlangName}
        className="hidden group-hover/tags:block"
      />
    </div>
  );
}

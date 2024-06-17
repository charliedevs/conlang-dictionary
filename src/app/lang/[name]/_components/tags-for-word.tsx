"use client";

import { Plus, TagIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
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
  return (
    <div className={props.className}>
      <Button
        onClick={async () => {
          await addTagToWord(props.wordId, "new tag");
          // TODO: This is broken - let's just query for tags through an API and use react-query
          revalidatePath(`/lang/${props.conlangName}`);
        }}
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
  const { word: w } = props;
  const tags = w.tags;
  return (
    <div
      id="tagsForWord"
      className="group/tags flex min-h-8 items-center gap-2"
    >
      <TagIcon className="size-5 rotate-[135deg] text-muted-foreground" />
      {tags.map((tag) => (
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
        wordId={w.id}
        conlangName={props.conlangName}
        className="hidden group-hover/tags:block"
      />
    </div>
  );
}

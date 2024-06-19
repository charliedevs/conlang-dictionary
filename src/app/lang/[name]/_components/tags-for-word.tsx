"use client";

import { Plus, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useTags } from "~/hooks/useTags";
import { type Tag } from "~/types/tag";
import { type Word } from "~/types/word";
import { addTagToWord } from "../_actions/tag";

const AddTagButton = forwardRef<HTMLButtonElement>(
  function AddTagButton(props, forwardedRef) {
    return (
      <Button
        {...props}
        ref={forwardedRef}
        variant="outline"
        size="sm"
        className="mt-0.5 flex h-6 items-center gap-1 px-1 text-muted-foreground md:mt-[0.05rem] md:border-none"
      >
        <Plus className="size-[14px]" />
        <p className="pr-0.5 text-xs font-semibold tracking-tighter md:sr-only">
          Add Tag
        </p>
      </Button>
    );
  },
);

function UserTagList(props: { tagSearch: string; existingWordTags: Tag[] }) {
  const userTags = useTags();
  if (userTags.isLoading) return <div>Loading...</div>;
  if (!userTags.data) return <div>No tags found</div>;
  const userTagsNotOnWord = userTags.data.filter(
    (tag) =>
      !props.existingWordTags.find(
        (existingTag) => existingTag.text === tag.text,
      ),
  );
  const searchTags = userTagsNotOnWord.filter((tag) =>
    tag.text.toLowerCase().includes(props.tagSearch.toLowerCase()),
  );
  return (
    <ScrollArea className="min-h-0 flex-grow overflow-auto [&>div]:max-h-60 [&>div]:md:max-h-44">
      <ul className="flex flex-col gap-2">
        {searchTags.map((tag) => (
          <li
            key={tag.id}
            className="rounded-md p-1 transition-all ease-in hover:cursor-pointer hover:bg-secondary"
          >
            <div className="text-md md:text-xs">{tag.text}</div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

function AddTagMenu(props: { word: Word; conlangName: string }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  async function handleAddTag() {
    try {
      await addTagToWord(props.word.id, "flowing");
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

  const [tagSearch, setTagSearch] = useState("");

  // Desktop view
  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <AddTagButton />
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="flex flex-col gap-4">
            <p className="text-center text-xs text-muted-foreground">
              Assign tags to {props.word.text}
            </p>
            <Input
              onChange={(e) => setTagSearch(e.target.value)}
              className="h-8"
            />
            <UserTagList
              tagSearch={tagSearch}
              existingWordTags={props.word.tags}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile view
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <AddTagButton />
      </DrawerTrigger>
      <DrawerContent className="flex min-h-[40vh] flex-col gap-4 px-28 pb-10">
        <DrawerDescription className="text-md py-4 text-center">
          Assign tags to {props.word.text}
        </DrawerDescription>
        <ExistingTags tags={props.word.tags} />
        <Input onChange={(e) => setTagSearch(e.target.value)} />
        <UserTagList tagSearch={tagSearch} existingWordTags={props.word.tags} />
      </DrawerContent>
    </Drawer>
  );
}

function ExistingTags(props: { tags: Tag[] }) {
  return (
    <div className="flex items-center justify-start gap-1">
      <TagIcon className="mr-1 mt-[0.05em] size-4 rotate-[135deg] text-muted-foreground" />
      {props.tags.map((tag) => (
        <Button
          key={tag.id}
          variant="ghost"
          size="sm"
          className="flex h-6 items-center gap-1 px-1 text-muted-foreground"
        >
          {tag.text}
        </Button>
      ))}
    </div>
  );
}

export function TagsForWord(props: { word: Word; conlangName: string }) {
  return (
    <div
      id="tagsForWord"
      className="group/tags flex min-h-8 items-center gap-2 md:gap-0.5"
    >
      <ExistingTags tags={props.word.tags} />
      <AddTagMenu word={props.word} conlangName={props.conlangName} />
    </div>
  );
}

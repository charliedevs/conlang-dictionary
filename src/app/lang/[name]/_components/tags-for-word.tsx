"use client";

import { Plus, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { LoadingSpinner } from "~/components/loading-spinner";
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
import { useTags } from "~/hooks/data/useTags";
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

function UserTagList(props: {
  tagSearch: string;
  existingWordTags: Tag[];
  onTagClick: (tag: Partial<Tag>) => void;
}) {
  const userTags = useTags();
  if (userTags.isLoading)
    return <div className="text-md md:text-xs">Loading...</div>;
  if (!userTags.data)
    return <div className="text-md md:text-xs">No tags found</div>;
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
        {props.tagSearch.length > 0 ? (
          props.existingWordTags.some((t) => t.text === props.tagSearch) ? (
            <li className="p-1">
              <div className="text-md md:text-xs">
                Tag &quot;{props.tagSearch}&quot; already on word
              </div>
            </li>
          ) : (
            !searchTags.some((t) => t.text === props.tagSearch) && (
              <li
                onClick={() => props.onTagClick({ text: props.tagSearch })}
                className="rounded-md p-1 transition-all ease-in hover:cursor-pointer hover:bg-secondary"
              >
                <div className="text-md md:text-xs">
                  Add new tag &quot;{props.tagSearch}&quot;
                </div>
              </li>
            )
          )
        ) : null}
        {searchTags.map((tag) => (
          <li
            key={tag.id}
            onClick={() => props.onTagClick(tag)}
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
  const [tagSearch, setTagSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  async function handleAddTag(tag: Partial<Tag>) {
    try {
      setIsLoading(true);
      await addTagToWord(props.word.id, tag);
      setTagSearch("");
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique")) {
        toast.error("Tag already exists");
      } else {
        toast.error("Failed to add tag");
      }
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");
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
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              disabled={isLoading}
              endAdornment={isLoading ? <LoadingSpinner /> : null}
              className="h-8"
            />
            <UserTagList
              tagSearch={tagSearch}
              existingWordTags={props.word.tags}
              onTagClick={handleAddTag}
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
      <DrawerContent className="flex min-h-[40vh] flex-col gap-4 px-10 pb-10">
        <DrawerDescription className="text-md py-4 text-center">
          Assign tags to {props.word.text}
        </DrawerDescription>
        <div className="flex flex-wrap items-center justify-start gap-1">
          <ExistingTags tags={props.word.tags} />
        </div>
        <Input
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          disabled={isLoading}
          endAdornment={isLoading ? <LoadingSpinner /> : null}
        />
        <UserTagList
          tagSearch={tagSearch}
          existingWordTags={props.word.tags}
          onTagClick={handleAddTag}
        />
      </DrawerContent>
    </Drawer>
  );
}

function ExistingTags(props: { tags: Tag[] }) {
  return (
    <>
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
    </>
  );
}

export function TagsForWord(props: {
  word: Word;
  conlangName: string;
  isConlangOwner: boolean;
}) {
  return (
    <div
      id="tagsForWord"
      className="group/tags flex min-h-8 flex-wrap items-center justify-start gap-2 md:gap-0.5"
    >
      <ExistingTags tags={props.word.tags} />
      {props.isConlangOwner && (
        <AddTagMenu word={props.word} conlangName={props.conlangName} />
      )}
    </div>
  );
}

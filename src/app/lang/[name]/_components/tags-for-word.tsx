"use client";

import { PopoverArrow, PopoverClose } from "@radix-ui/react-popover";
import { Plus, TagIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { LoadingSpinner } from "~/components/loading-spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
import { cn } from "~/lib/utils";
import { type Tag } from "~/types/tag";
import { type Word } from "~/types/word";
import { addTagToWord, removeTagFromWord, type TagAdd } from "../_actions/tag";

const AddTagButton = forwardRef<HTMLButtonElement>(
  function AddTagButton(props, forwardedRef) {
    return (
      <Button
        {...props}
        ref={forwardedRef}
        variant="outline"
        size="sm"
        className="mt-0.5 flex h-6 items-center gap-1 px-1 text-muted-foreground focus:bg-accent focus:text-primary focus-visible:ring-offset-0 md:mt-[0.05rem] md:border-none"
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
  onTagClick: (tag: TagAdd) => void;
  selectedTag: TagAdd | null;
  setSelectedTag: Dispatch<SetStateAction<TagAdd | null>>;
}) {
  const userTags = useTags();
  const userTagsNotOnWord =
    userTags.data?.filter(
      (tag) =>
        !props.existingWordTags.find(
          (existingTag) => existingTag.text === tag.text,
        ),
    ) ?? [];
  const searchTags = userTagsNotOnWord.filter((tag) =>
    tag.text.toLowerCase().includes(props.tagSearch.toLowerCase()),
  );
  const isTagAlreadyOnWord = props.existingWordTags.some(
    (existingTag) => existingTag.text === props.tagSearch,
  );
  const isNewTagName = !searchTags.some((t) => t.text === props.tagSearch);

  // Set selected tag from search input so user can press enter to add tag
  useEffect(() => {
    if (props.tagSearch.length > 0) {
      const matchingTag = searchTags.find((t) =>
        t.text.includes(props.tagSearch),
      );
      if (matchingTag) {
        props.setSelectedTag(matchingTag);
      } else if (isNewTagName) {
        props.setSelectedTag({ text: props.tagSearch });
      }
    } else {
      props.setSelectedTag(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tagSearch]);

  if (userTags.isLoading)
    return <div className="text-md md:text-xs">Loading...</div>;
  if (!userTags.data)
    return <div className="text-md md:text-xs">No tags found</div>;

  return (
    <ScrollArea className="min-h-0 flex-grow overflow-auto pb-10 md:pb-0 [&>div]:max-h-60 [&>div]:md:max-h-44">
      <ul className="flex flex-col gap-2">
        {searchTags.map((tag) => (
          <li
            key={tag.id}
            onClick={() => props.onTagClick(tag)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onTagClick(tag);
              }
            }}
            onFocus={() => props.setSelectedTag(tag)}
            tabIndex={0}
            className={cn(
              "rounded-md p-1 transition-all ease-in hover:cursor-pointer hover:bg-secondary focus:bg-secondary focus:outline-none",
              props.selectedTag?.text === tag.text
                ? "bg-secondary/70 font-medium"
                : "",
            )}
          >
            <div className="text-md md:text-xs">{tag.text}</div>
          </li>
        ))}
        {props.tagSearch.length > 0 ? (
          isTagAlreadyOnWord ? (
            <li className="p-1">
              <div className="text-md italic text-muted-foreground md:text-xs">
                Tag &quot;{props.tagSearch}&quot; already on word
              </div>
            </li>
          ) : (
            isNewTagName && (
              <li
                onClick={() => props.onTagClick({ text: props.tagSearch })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    props.onTagClick({ text: props.tagSearch });
                  }
                }}
                onFocus={() => props.setSelectedTag({ text: props.tagSearch })}
                tabIndex={0}
                className={cn(
                  "rounded-md p-1 transition-all ease-in hover:cursor-pointer hover:bg-secondary focus:bg-secondary focus:outline-none",
                  props.selectedTag?.text === props.tagSearch
                    ? "bg-secondary/70 font-medium"
                    : "",
                )}
              >
                <div className="text-md md:text-xs">
                  Add new tag &quot;{props.tagSearch}&quot;
                </div>
              </li>
            )
          )
        ) : null}
      </ul>
    </ScrollArea>
  );
}

function AddTagMenu(props: { word: Word; conlangName: string }) {
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagAdd | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  async function handleAddTag(tag: TagAdd) {
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
      setIsOpen(false);
    }
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              onKeyDown={async (e) => {
                if (e.key === "Enter" && selectedTag) {
                  await handleAddTag(selectedTag);
                }
              }}
              placeholder="Enter tag name..."
              disabled={isLoading}
              endAdornment={isLoading ? <LoadingSpinner /> : null}
              className="h-8"
            />
            <UserTagList
              tagSearch={tagSearch.trim()}
              existingWordTags={props.word.tags}
              onTagClick={handleAddTag}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
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
      <DrawerContent className="flex min-h-[40vh] flex-col gap-4 px-10">
        <DrawerDescription className="text-md py-4 text-center">
          Assign tags to {props.word.text}
        </DrawerDescription>
        <div className="flex flex-wrap items-center justify-start gap-1">
          <ExistingTags tags={props.word.tags} wordId={props.word.id} />
        </div>
        <Input
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && selectedTag) {
              await handleAddTag(selectedTag);
            }
          }}
          placeholder="Enter tag name..."
          disabled={isLoading}
          endAdornment={isLoading ? <LoadingSpinner /> : null}
        />
        <UserTagList
          tagSearch={tagSearch.trim()}
          existingWordTags={props.word.tags}
          onTagClick={handleAddTag}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ExistingTags(props: { tags: Tag[]; wordId: number }) {
  const [isDeletingTag, setIsDeletingTag] = useState(0);
  useEffect(() => {
    setIsDeletingTag(0);
  }, [props.tags.length]);

  const router = useRouter();
  async function handleRemoveTag(tag: Tag) {
    try {
      setIsDeletingTag(tag.id);
      await removeTagFromWord(props.wordId, tag.id);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Could not remove tag");
    }
  }

  const tagList = props.tags.filter((t) => t.id !== isDeletingTag);
  return (
    <>
      <TagIcon className="mr-1 mt-[0.05em] size-4 rotate-[135deg] text-muted-foreground" />
      {tagList.map((tag) => (
        <Popover key={tag.id}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-6 items-center gap-1 px-1 text-muted-foreground"
              tabIndex={-1}
            >
              {tag.text}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit border-none p-2">
            <div className="flex flex-col items-center justify-center gap-1 text-xs">
              <PopoverClose asChild>
                <Button
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isDeletingTag === tag.id}
                  variant="destructive"
                  className="size-8 p-1 text-xs"
                >
                  <Trash2 className="size-5" />
                </Button>
              </PopoverClose>
            </div>
            <PopoverArrow className="fill-card" />
          </PopoverContent>
        </Popover>
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
      <ExistingTags tags={props.word.tags} wordId={props.word.id} />
      {props.isConlangOwner && (
        <AddTagMenu word={props.word} conlangName={props.conlangName} />
      )}
    </div>
  );
}

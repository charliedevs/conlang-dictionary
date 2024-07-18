"use client";

import { PopoverArrow, PopoverClose } from "@radix-ui/react-popover";
import { Plus, TagIcon, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "~/components/loading-spinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useTags } from "~/hooks/data/useTags";
import { cn } from "~/lib/utils";
import { tagColor } from "~/server/db/schema";
import { type Tag, type TagColor } from "~/types/tag";
import { type Word } from "~/types/word";
import { addTagToWord, removeTagFromWord, type TagAdd } from "../_actions/tag";

function getTagColor(color: TagColor | null) {
  if (color === "red")
    return "border-red-400 bg-red-400/60 text-red-900 dark:text-red-100/90";
  if (color === "orange")
    return "border-orange-400 bg-orange-400/60 text-orange-900 dark:text-orange-200";
  if (color === "yellow")
    return "border-yellow-300 bg-yellow-300/60 text-yellow-900 dark:text-yellow-100";
  if (color === "green")
    return "border-green-400 bg-green-400/60 text-green-800 dark:text-green-200";
  if (color === "blue")
    return "border-blue-400 bg-blue-400/60 text-blue-900 dark:text-blue-100/90";
  if (color === "purple")
    return "border-purple-400 bg-purple-400/60 text-purple-900 dark:text-purple-200";
  if (color === "neutral")
    return "border-slate-300 bg-slate-300/60 text-slate-600 dark:text-slate-200";
  return "outline outline-border outline-1 text-slate-700 dark:text-slate-200";
}

function Tag(props: {
  text: string;
  color: TagColor | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-fit items-center rounded-md px-1.5 py-0.5 not-italic",
        getTagColor(props.color),
        props.className,
      )}
    >
      <div className="text-[16px] font-medium tracking-tight md:text-xs">
        {props.text}
      </div>
    </div>
  );
}

const AddTagButton = forwardRef<HTMLButtonElement>(
  function AddTagButton(props, forwardedRef) {
    return (
      <Button
        {...props}
        ref={forwardedRef}
        variant="outline"
        size="sm"
        className="flex h-7 items-center gap-1 px-1 text-muted-foreground focus:bg-accent focus:text-primary focus-visible:ring-offset-0 md:mt-[0.05rem] md:h-6 md:border-none"
      >
        <Plus className="size-[14px]" />
        <p className="pr-0.5 text-sm font-semibold tracking-tighter md:sr-only md:text-xs">
          Add Tag
        </p>
      </Button>
    );
  },
);

function AddTagList(props: {
  tagSearch: string;
  existingWordTags: Tag[];
  onTagClick: (tag: TagAdd) => void;
  selectedTag: TagAdd | null;
  setSelectedTag: Dispatch<SetStateAction<TagAdd | null>>;
  selectedColor: TagColor | null;
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
  const isNewTagName =
    !searchTags.some((t) => t.text === props.tagSearch) &&
    searchTags.length === 0;

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

  if (userTags.isLoading) return <div className="md:text-xs">Loading...</div>;
  if (!userTags.data) return <div className="md:text-xs">No tags found</div>;

  return (
    <ScrollArea className="h-24 md:h-fit md:min-h-0 md:flex-grow [&>div]:md:max-h-44">
      <ul className="flex flex-col gap-1">
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
            <Tag
              text={tag.text}
              color={tag.color ?? null}
              className="md:text-sm"
            />
          </li>
        ))}
        {props.tagSearch.length > 0 ? (
          isTagAlreadyOnWord ? (
            <li className="p-1">
              <div className="flex items-center gap-1 italic text-muted-foreground md:text-xs">
                Tag
                <Tag
                  text={
                    props.existingWordTags.find(
                      (t) => t.text === props.tagSearch,
                    )?.text ?? props.tagSearch
                  }
                  color={
                    props.existingWordTags.find(
                      (t) => t.text === props.tagSearch,
                    )?.color ?? null
                  }
                  className="py-[0.05em] md:text-sm"
                />
                already on word
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
                <div className="flex items-center gap-1 md:text-xs">
                  Add new tag{" "}
                  <Tag
                    text={props.tagSearch}
                    color={props.selectedColor}
                    className="py-[0.05em] md:text-sm"
                  />
                </div>
              </li>
            )
          )
        ) : null}
      </ul>
    </ScrollArea>
  );
}

interface ColorButtonProps {
  onClick: () => void;
}
function ColorButton(props: PropsWithChildren<ColorButtonProps>) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          props.onClick();
        }
      }}
      className="rounded-full opacity-80 hover:opacity-100"
    >
      {props.children}
    </button>
  );
}

function ColorDot(props: { color: TagColor | null }) {
  return (
    <div
      className={cn(
        "flex size-6 items-center justify-center rounded-full border border-muted-foreground bg-transparent md:size-4",
        getTagColor(props.color),
      )}
    >
      {!props.color && <X className="size-5 text-muted-foreground md:size-3" />}
    </div>
  );
}

function TagColorSelector(props: {
  visible: boolean;
  selectedColor: TagColor | null;
  setSelectedColor: Dispatch<SetStateAction<TagColor | null>>;
  className?: string;
}) {
  const colors = tagColor.enumValues;
  return (
    <div
      className={cn(
        "my-2 flex w-full items-center justify-between gap-2 px-2 md:my-0",
        props.visible ? "not-sr-only" : "sr-only",
        props.className,
      )}
    >
      <ColorButton onClick={() => props.setSelectedColor(null)}>
        <ColorDot color={null} />
      </ColorButton>
      {colors.map((color) => (
        <ColorButton key={color} onClick={() => props.setSelectedColor(color)}>
          <ColorDot color={color} />
        </ColorButton>
      ))}
    </div>
  );
}

function AddTagMenu(props: { word: Word; conlangName: string }) {
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagAdd | null>(null);
  const [selectedColor, setSelectedColor] = useState<TagColor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setSelectedColor(null), [props.word.text]);

  const router = useRouter();
  async function handleAddTag(tag: TagAdd) {
    const newTag = tag.id ? tag : { ...tag, color: selectedColor };
    try {
      setIsLoading(true);
      await addTagToWord(props.word.id, newTag);
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <AddTagButton />
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-60">
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
            className="md:h-8"
          />
          <TagColorSelector
            visible={Boolean(selectedTag && !selectedTag.id)}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <AddTagList
            tagSearch={tagSearch.trim()}
            existingWordTags={props.word.tags}
            onTagClick={handleAddTag}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            selectedColor={selectedColor}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ExistingTags(props: {
  tags: Tag[];
  wordId: number;
  isConlangOwner: boolean;
}) {
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
              className="mx-0.5 h-6 p-0 focus-visible:ring-offset-0 disabled:opacity-100"
              disabled={!props.isConlangOwner}
            >
              <Tag
                text={tag.text}
                color={tag.color ?? null}
                className="hover:drop-shadow-sm"
              />
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
      <ExistingTags
        tags={props.word.tags}
        wordId={props.word.id}
        isConlangOwner={props.isConlangOwner}
      />
      {props.isConlangOwner && (
        <AddTagMenu word={props.word} conlangName={props.conlangName} />
      )}
    </div>
  );
}

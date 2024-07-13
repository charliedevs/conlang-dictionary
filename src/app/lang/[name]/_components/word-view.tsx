"use client";

import { CommandGroup } from "cmdk";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { type Word } from "~/types/word";
import { EditWordForm } from "./forms/edit-word-form";
import { TagsForWord } from "./tags-for-word";

const sectionTypes = [
  { value: "pronunciation", label: "Pronunciation" },
  { value: "definition", label: "Definition" },
  { value: "related", label: "Related Words" },
  { value: "custom", label: "Custom" },
];

function SectionTypeSelect(props: {
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select Section Type"
          className="w-full justify-between"
        >
          {props.selectedType
            ? sectionTypes.find((t) => t.value === props.selectedType)?.label
            : "Select Type..."}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search Types..." />
          <CommandList>
            <CommandEmpty>No Type found.</CommandEmpty>
            <CommandGroup>
              {sectionTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(val) => {
                    props.setSelectedType(
                      val === props.selectedType ? "" : type.value,
                    );
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      props.selectedType === type.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AddSection(props: { word: Word }) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  return (
    <div className="min-h-6 rounded-md bg-accent transition-all">
      {isAdding ? (
        <div className="flex flex-col gap-1 p-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Add Section</h3>
            <Button
              onClick={() => setIsAdding(false)}
              variant="ghost"
              size="icon"
              className="size-4"
            >
              <XIcon className="text-muted-foreground" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <SectionTypeSelect
              key={selectedType}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="secondary"
          className="w-full opacity-50 transition-all hover:opacity-100"
          title="Add Section"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function WordDetails(props: {
  word: Word;
  conlangName: string;
  isConlangOwner: boolean;
}) {
  const { word: w } = props;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-start text-2xl font-medium">{w.text}</h3>
      <TagsForWord
        word={w}
        conlangName={props.conlangName}
        isConlangOwner={props.isConlangOwner}
      />
      <p className="my-6 whitespace-pre-wrap text-sm text-muted-foreground">
        {w.definition}
      </p>
      <div className="flex flex-col gap-2">
        {w.pronunciation && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium">Pronunciation</div>
            <div className="text-xs">{w.pronunciation}</div>
          </div>
        )}
        {w.gloss && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium">Gloss</div>
            <div className="text-xs">{w.gloss}</div>
          </div>
        )}
      </div>
      <AddSection word={w} />
    </div>
  );
}

function EditWordButton(props: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex">
      <Button
        variant="outline"
        onClick={() => props.setIsEditing(true)}
        className="w-full"
      >
        Edit Word
      </Button>
    </div>
  );
}

export function WordView(props: {
  word: Word | null;
  conlangName: string;
  setSelectedWord: Dispatch<SetStateAction<Word | null>>;
  isConlangOwner: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Desktop view
  if (isDesktop && props.word) {
    if (!isEditing) {
      return (
        <div className="flex min-w-[45vw] flex-col gap-4">
          <WordDetails
            word={props.word}
            conlangName={props.conlangName}
            isConlangOwner={props.isConlangOwner}
          />
          {props.isConlangOwner && (
            <EditWordButton setIsEditing={setIsEditing} />
          )}
        </div>
      );
    }
    return (
      <div className="min-w-[45vw]">
        <EditWordForm
          word={props.word}
          afterSubmit={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Mobile view
  if (!isEditing) {
    return (
      <Sheet
        open={Boolean(props.word)}
        onOpenChange={() => props.setSelectedWord(null)}
      >
        <SheetContent className="flex w-[80vw] flex-col gap-6">
          <SheetHeader>
            <SheetTitle>Word Details</SheetTitle>
          </SheetHeader>
          {props.word ? (
            <WordDetails
              word={props.word}
              conlangName={props.conlangName}
              isConlangOwner={props.isConlangOwner}
            />
          ) : null}
          {props.isConlangOwner && (
            <EditWordButton setIsEditing={setIsEditing} />
          )}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Sheet
      open={Boolean(props.word)}
      onOpenChange={() => props.setSelectedWord(null)}
    >
      <SheetContent className="flex w-[80vw] flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Edit Word</SheetTitle>
          <SheetDescription>Change or add word details.</SheetDescription>
        </SheetHeader>
        {props.word ? (
          <EditWordForm
            word={props.word}
            afterSubmit={() => setIsEditing(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

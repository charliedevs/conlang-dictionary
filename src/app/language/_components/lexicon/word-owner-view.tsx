"use client";

import { ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { capitalize } from "~/lib/strings";
import { type Word } from "~/types/word";
import { AddDefinitionSectionForm } from "./add-definition-section";
import { DeleteWord } from "./delete-word";
import { EditWordButton, EditWordForm } from "./edit-word";

function SectionTypeSelect(props: {
  sectionType: string;
  setSectionType: Dispatch<SetStateAction<string>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-fit justify-start pl-1 pr-2 text-lg"
        >
          <ChevronsUpDownIcon className="mr-1 size-4" />
          {capitalize(props.sectionType)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => props.setSectionType("definition")}>
            Definition
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.setSectionType("custom")}>
            Custom
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddSection(props: { word: Word }) {
  const [isAdding, setIsAdding] = useState(false);
  const [sectionType, setSectionType] = useState("definition");

  if (isAdding) {
    return (
      <div
        id="add-section"
        className="relative flex max-w-lg flex-col gap-2 rounded-md bg-card px-5 py-4 dark:bg-accent"
      >
        <div className="absolute right-2 top-2">
          <Button
            onClick={() => setIsAdding(false)}
            variant="ghost"
            size="sm"
            className="size-6 p-1"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <SectionTypeSelect
          sectionType={sectionType}
          setSectionType={setSectionType}
        />
        <div className="flex flex-col gap-1">
          {sectionType === "definition" && (
            <AddDefinitionSectionForm word={props.word} />
          )}
        </div>
      </div>
    );
  }
  return (
    <div id="add-section-button" className="flex items-center justify-end">
      <Button
        onClick={() => setIsAdding(true)}
        variant="outline"
        className="w-full md:w-auto"
      >
        <PlusIcon className="mr-1 size-4" />
        Add Section
      </Button>
    </div>
  );
}

export function WordOwnerView(props: { word: Word }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  return (
    <div id="word" className="flex flex-col gap-1">
      {isEditing ? (
        <EditWordForm
          word={props.word}
          afterSubmit={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div
          id="word-header"
          className="group/header flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">{props.word.text}</h2>
            <EditWordButton onClick={() => setIsEditing(true)} />
          </div>
          <DeleteWord
            word={props.word}
            afterDelete={() =>
              router.push(`/language/${props.word.conlangId}/?view=lexicon`)
            }
          />
        </div>
      )}
      <Separator />
      <div id="word-sections" className="my-2">
        <div id="add-new-section">
          <AddSection word={props.word} />
        </div>
      </div>
    </div>
  );
}

"use client";

import parseHtml from "html-react-parser";
import { EditIcon, PlusIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { ordinal } from "~/lib/numbers";
import { capitalize } from "~/lib/strings";
import { cn } from "~/lib/utils";
import { type DefinitionUpdate } from "~/server/queries";
import { type Section, type SectionType, type Word } from "~/types/word";
import {
  createDefinition,
  editDefinition,
  removeDefinition,
} from "../_actions/word";
import { EditWordForm } from "./forms/edit-word-form";
import { NewDefinitionSectionForm } from "./forms/new-section-forms";
import { TagsForWord } from "./tags-for-word";

const sectionTypes: { value: SectionType; label: string }[] = [
  // { value: "pronunciation", label: "Pronunciation" },
  { value: "definition", label: "Definition" },
  // { value: "related", label: "Related Words" },
  { value: "custom", label: "Custom" },
];

function AddSection(props: { word: Word }) {
  const [isAdding, setIsAdding] = useState(false);
  // TODO: change to useform and zod schema
  const [sectionType, setSectionType] = useState<SectionType | null>(null);

  return (
    <div className="min-h-6 rounded-md bg-accent transition-all">
      {isAdding ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              New Section
            </h3>
            <Button
              onClick={() => {
                setIsAdding(false);
                setSectionType(null);
              }}
              variant="ghost"
              size="icon"
              className="size-4"
            >
              <XIcon className="text-muted-foreground" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {/* TODO: Just change to select? combobox is weird on mobile */}
            <Combobox
              options={sectionTypes}
              value={sectionType ?? ""}
              onChange={(value) => {
                if (value) {
                  setSectionType(value as SectionType);
                } else {
                  setSectionType(null);
                }
              }}
              placeholder="Select a section type..."
              className="w-full font-semibold"
            />
            {sectionType && (
              <>
                {sectionType === "definition" && (
                  <NewDefinitionSectionForm
                    conlangId={props.word.conlangId}
                    wordId={props.word.id}
                    afterSubmit={() => setIsAdding(false)}
                  />
                )}
                {sectionType === "custom" && (
                  <>
                    WORK IN PROGRESS
                    <Input placeholder="Section title..." />
                    <TextEditor
                      value=""
                      onChange={() => null}
                      className="bg-background"
                    />
                  </>
                )}
              </>
            )}
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

function AddDefinition(props: { section: Section; className?: string }) {
  const [isAdding, setIsAdding] = useState(false);
  // TODO: change to useform and zod schema
  const currentNumberOfDefinitions = props.section.definitions?.length ?? 0;
  const [definition, setDefinition] = useState({
    sectionId: props.section.id,
    text: "",
  });
  const router = useRouter();

  if (!isAdding)
    return (
      <Button
        onClick={() => setIsAdding(true)}
        variant="secondary"
        className={cn(
          "h-8 w-full text-sm opacity-70 transition-all hover:opacity-100",
          props.className,
        )}
      >
        <PlusIcon className="size-4" /> Add{" "}
        {ordinal(currentNumberOfDefinitions + 1)} Definition
      </Button>
    );
  return (
    <li>
      <div className="my-4 flex flex-col gap-2">
        <TextEditor
          value={definition.text}
          onChange={(value) => setDefinition({ ...definition, text: value })}
          className="bg-background"
        />
        <Button
          onClick={async () => {
            await createDefinition(definition);
            setIsAdding(false);
            setDefinition({ sectionId: props.section.id, text: "" });
            router.refresh();
          }}
        >
          Add Definition
        </Button>
        <Button
          onClick={() => {
            setIsAdding(false);
            setDefinition({ sectionId: props.section.id, text: "" });
          }}
          variant="ghost"
          className="w-full"
          title="Cancel"
        >
          Cancel
        </Button>
      </div>
    </li>
  );
}

function Definitions(props: {
  word: Word;
  section: Section;
  isConlangOwner: boolean;
}) {
  const { word: w, section: s } = props;
  const [editingDefinition, setEditingDefinition] = useState<
    DefinitionUpdate | undefined
  >();
  const router = useRouter();
  const handleSave = async (d: DefinitionUpdate) => {
    await editDefinition(d);
    setEditingDefinition(undefined);
    router.refresh();
  };
  const handleDelete = async (d: DefinitionUpdate) => {
    await removeDefinition(d);
    setEditingDefinition(undefined);
    router.refresh();
  };
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">
        {s?.lexicalCategory?.category
          ? capitalize(s.lexicalCategory.category)
          : ""}
      </h3>
      <h4 className="text-sm font-bold">{w.text}</h4>
      <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
        {s.definitions
          ?.sort((a, b) => a.order - b.order)
          .map((d) => (
            <li
              key={d.id}
              className={cn(
                "pb-2 transition-all",
                props.isConlangOwner &&
                  "group/def pb-6 md:pb-2 md:group-hover/section:pb-2.5",
              )}
            >
              {editingDefinition?.id === d.id ? (
                <div className="">
                  <TextEditor
                    value={editingDefinition.text}
                    onChange={(value) =>
                      setEditingDefinition({
                        ...editingDefinition,
                        text: value,
                      })
                    }
                    customToolbarActions={
                      <>
                        <Button
                          onClick={() => setEditingDefinition(undefined)}
                          variant="outline"
                          size="sm"
                          title="Cancel"
                          className="h-9 bg-transparent px-2.5 ring-offset-background transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <XIcon className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleSave(editingDefinition)}
                          variant="outline"
                          size="sm"
                          title="Save"
                          className="h-9 bg-transparent px-2.5 text-blue-700 ring-offset-background transition-colors hover:bg-blue-700/10 hover:text-blue-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <SaveIcon className="size-4" />
                        </Button>
                      </>
                    }
                    className="min-h-[30px]"
                  />
                </div>
              ) : (
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="">{parseHtml(d.text)}</div>
                  {props.isConlangOwner && (
                    <div className="flex gap-2 transition-all md:gap-1 md:opacity-0 md:group-hover/def:opacity-100">
                      <Button
                        onClick={() => setEditingDefinition(d)}
                        size="icon"
                        variant="ghost"
                        className="size-6 md:size-5"
                      >
                        <EditIcon className="-mb-0.5 size-5 md:size-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(d)}
                        size="icon"
                        variant="ghost"
                        className="size-6 hover:bg-red-800/10 md:size-5"
                      >
                        <Trash2Icon className="size-5 text-red-800 md:size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        {props.isConlangOwner && (
          <AddDefinition
            section={s}
            className={
              !s.definitions?.length
                ? ""
                : "transition-all md:opacity-0 md:group-hover/section:opacity-100"
            }
          />
        )}
      </ol>
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
      {w.sections && w.sections.length > 0 && (
        <div className="mb-4 flex flex-col gap-1">
          {w.sections.map((s) => (
            <div
              key={s.id}
              className="group/section flex flex-col gap-1 rounded-md p-2 transition-all focus-within:bg-card/50 hover:bg-card/50"
            >
              {s.type === "definition" && (
                <Definitions
                  word={w}
                  section={s}
                  isConlangOwner={props.isConlangOwner}
                />
              )}
              {s.customTitle && (
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium">{s.customTitle}</div>
                  <div className="text-xs">{s.customText}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {props.isConlangOwner && <AddSection word={w} />}
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
        <div className="h-full min-w-[50vw] max-w-[70vw]">
          <div className="flex w-full max-w-[600px] flex-col gap-4">
            <WordDetails
              word={props.word}
              conlangName={props.conlangName}
              isConlangOwner={props.isConlangOwner}
            />
            {props.isConlangOwner && (
              <EditWordButton setIsEditing={setIsEditing} />
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="min-w-[50vw] max-w-[70vw]">
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
        <SheetContent className="flex w-[80vw] flex-col gap-6 px-2">
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
      <SheetContent className="flex w-[80vw] flex-col gap-6 px-2">
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

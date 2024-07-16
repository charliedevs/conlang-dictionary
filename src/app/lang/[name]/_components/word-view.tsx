"use client";

import parseHtml from "html-react-parser";
import { PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { TextEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { type Section, type SectionType, type Word } from "~/types/word";
import {
  createDefinition,
  createSection,
  type CreateSection,
} from "../_actions/section";
import { EditWordForm } from "./forms/edit-word-form";
import { TagsForWord } from "./tags-for-word";

const sectionTypes: { value: SectionType; label: string }[] = [
  // { value: "pronunciation", label: "Pronunciation" },
  { value: "definition", label: "Definition" },
  // { value: "related", label: "Related Words" },
  { value: "custom", label: "Custom" },
];

function LexicalCategorySelect(props: {
  conlangId: number;
  defaultValue?: number | null;
  onChange: (value: string) => void;
  className?: string;
}) {
  // TODO: get lexical categories from server
  const lexicalCategories = {
    isLoading: false,
    data: ["noun", "verb", "adjective", "adverb"].map((category, idx) => ({
      id: idx + 1,
      category,
    })),
  };
  return (
    <Select
      onValueChange={props.onChange}
      defaultValue={String(props.defaultValue)}
    >
      <SelectTrigger
        disabled={lexicalCategories.isLoading}
        className={props.className}
      >
        <SelectValue placeholder="Part of speech..." />
      </SelectTrigger>
      <SelectContent>
        {lexicalCategories.isLoading && <div>Loading...</div>}
        {lexicalCategories.data?.map((category) => (
          <SelectItem key={category.id} value={String(category.id)}>
            {category.category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddSection(props: { word: Word }) {
  const [isAdding, setIsAdding] = useState(false);
  // TODO: change to useform and zod schema
  const [section, setSection] = useState<CreateSection | null>(null);
  const router = useRouter();
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
                setSection(null);
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
              value={section?.type ?? ""}
              onChange={(value) => {
                if (value) {
                  setSection({
                    wordId: props.word.id,
                    type: value as SectionType,
                  });
                } else {
                  setSection(null);
                }
              }}
              placeholder="Select a section type..."
              className="w-full font-semibold"
            />
            {section && (
              <>
                {section.type === "definition" && (
                  <>
                    {/* TODO: Make input into custom combobox pulled from db with extra actions */}
                    <LexicalCategorySelect
                      conlangId={props.word.conlangId}
                      defaultValue={section.lexicalCategoryId}
                      onChange={(value) =>
                        setSection({
                          ...section,
                          lexicalCategoryId: Number(value),
                        })
                      }
                    />
                  </>
                )}
                {section.type === "custom" && (
                  <>
                    <Input placeholder="Section title..." />
                    <TextEditor
                      value=""
                      onChange={() => null}
                      className="bg-background"
                    />
                  </>
                )}
                <Button
                  // disabled={!definition.lexicalCategoryId || !definition.text}
                  onClick={async () => {
                    await createSection(section);
                    setIsAdding(false);
                    router.refresh();
                  }}
                >
                  {section.type === "definition"
                    ? "Add Definition Section"
                    : "Add Section"}
                </Button>
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
        <PlusIcon className="size-4" /> Add Definition
      </Button>
    );
  return (
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
          router.refresh();
        }}
      >
        Add Definition
      </Button>
    </div>
  );
}

function DefinitionView(props: {
  word: Word;
  section: Section;
  isConlangOwner: boolean;
}) {
  const { word: w, section: s } = props;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">
        {s?.lexicalCategory?.category ?? ""}
      </h3>
      <h4 className="text-sm font-bold">{w.text}</h4>
      <ol className="m-4 list-decimal pl-4 text-sm text-primary/80">
        {s.definitions
          ?.sort((a, b) => a.order - b.order)
          .map((d) => (
            <li key={d.id} className="pb-1">
              {parseHtml(d.text)}
            </li>
          ))}
      </ol>
      {props.isConlangOwner && (
        <AddDefinition
          section={s}
          className={
            !s.definitions?.length
              ? ""
              : "transition-all md:invisible md:group-hover/section:visible"
          }
        />
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
      {w.sections.length > 0 && (
        <div className="mb-4 flex flex-col gap-4">
          {w.sections.map((s) => (
            <div key={s.id} className="group/section flex flex-col gap-1">
              {s.type === "definition" && (
                <DefinitionView
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
        <div className="flex min-w-[45vw] max-w-[50vw] flex-col gap-4">
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

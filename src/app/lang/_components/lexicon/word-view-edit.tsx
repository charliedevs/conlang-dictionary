"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import parseHtml from "html-react-parser";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  GripVerticalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { capitalize } from "~/lib/strings";
import { cn } from "~/lib/utils";
import {
  type Definition,
  type LexicalSection,
  type Word,
  type WordSection,
} from "~/types/word";
import { AddCustomSectionForm } from "./add-custom-section";
import { AddDefinitionButton, AddDefinitionForm } from "./add-definition";
import { AddDefinitionSectionForm } from "./add-definition-section";
import { AddSectionForm } from "./add-section";
import { DeleteDefinition } from "./delete-definition";
import { DeleteSection } from "./delete-section";
import { DeleteWord } from "./delete-word";
import { EditDefinitionButton, EditDefinitionForm } from "./edit-definition";
import { EditSectionButton, EditSectionForm } from "./edit-section";
import { EditWordButton, EditWordForm } from "./edit-word";

// --- New sortable hook for lexicalSections ---
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ArrowTurnLeft } from "~/components/icons/arrow-turn-left";

function useSortableLexicalSections(sections: LexicalSection[]) {
  // For now, just return the sections in order and a drag end handler that alerts
  const sensors = useSensors(useSensor(PointerSensor));
  function handleDragEnd() {
    window.alert("Reordering lexical sections is not implemented yet.");
  }
  return { sections, sensors, handleDragEnd };
}

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
          {capitalize(props.sectionType)} Section
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
        className="relative flex min-h-80 max-w-lg flex-col gap-2 rounded-md bg-card px-5 py-4 transition-all dark:bg-accent"
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
          {sectionType === "custom" && (
            <AddCustomSectionForm
              word={props.word}
              afterSubmit={() => setIsAdding(false)}
            />
          )}
          {sectionType === "definition" && (
            <AddDefinitionSectionForm
              word={props.word}
              afterSubmit={() => setIsAdding(false)}
            />
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      id="add-section-button"
      className="mt-1 flex items-center justify-end md:mt-0"
    >
      <Button
        onClick={() => setIsAdding(true)}
        variant="ghost"
        className="md:h-8"
      >
        <PlusIcon className="mr-1 size-4 text-green-600" />
        Add Section
      </Button>
    </div>
  );
}

function Definition(props: { definition: Definition }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  if (!isEditing) {
    return (
      <div className="group/definition flex items-start justify-between gap-1">
        <div className="flex-1">{parseHtml(props.definition.text)}</div>
        <div className="-mt-1 flex items-center gap-3 md:gap-1">
          <EditDefinitionButton onClick={() => setIsEditing(true)} />
          <DeleteDefinition
            definition={props.definition}
            afterDelete={() => router.refresh()}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <EditDefinitionForm
        definition={props.definition}
        afterSubmit={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    </div>
  );
}

function DefinitionSection(props: { section: WordSection; word: Word }) {
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [definitions, setDefinitions] = useState(
    props.section.definitionSection?.definitions ?? [],
  );

  // Update local state when props change
  useEffect(() => {
    setDefinitions(props.section.definitionSection?.definitions ?? []);
  }, [props.section.definitionSection?.definitions]);

  const handleAddDefinition = (newDefinition: Definition) => {
    setDefinitions((prev) => [...prev, newDefinition]);
    setIsAddingDefinition(false);
  };

  const category = props.section?.definitionSection?.lexicalCategory.category;
  const sectionTitle = props.section.title
    ? category && category !== props.section.title
      ? `${props.section.title} (${category})`
      : props.section.title
    : (category ?? "");

  const definitionSectionId = props.section.definitionSection?.id;

  if (isEditing) {
    return (
      <div className="group/section">
        <EditSectionForm
          section={props.section}
          afterSubmit={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
        <h4 className="text-sm font-bold">{props.word.text}</h4>
        <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
          {definitions.map((d) => (
            <li key={d.id} className="pb-4 md:pb-2">
              <Definition definition={d} />
            </li>
          ))}
          {isAddingDefinition && definitionSectionId ? (
            <li>
              <AddDefinitionForm
                definitionSectionId={definitionSectionId}
                afterSubmit={handleAddDefinition}
                onCancel={() => setIsAddingDefinition(false)}
              />
            </li>
          ) : (
            <li className="list-none">
              <AddDefinitionButton
                onClick={() => setIsAddingDefinition(true)}
              />
            </li>
          )}
        </ol>
      </div>
    );
  }

  return (
    <div className="group/section">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-bold">{sectionTitle}</h3>
        <div className="flex items-center gap-1">
          <EditSectionButton onClick={() => setIsEditing(true)} />
          <DeleteSection sectionId={props.section.id} />
        </div>
      </div>
      <h4 className="text-sm font-bold">{props.word.text}</h4>
      <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
        {definitions.map((d) => (
          <li key={d.id} className="pb-4 md:pb-2">
            <Definition definition={d} />
          </li>
        ))}
        {isAddingDefinition && definitionSectionId ? (
          <li>
            <AddDefinitionForm
              definitionSectionId={definitionSectionId}
              afterSubmit={handleAddDefinition}
              onCancel={() => setIsAddingDefinition(false)}
            />
          </li>
        ) : (
          <li className="list-none">
            {definitionSectionId && (
              <AddDefinitionButton
                onClick={() => setIsAddingDefinition(true)}
              />
            )}
          </li>
        )}
      </ol>
    </div>
  );
}

function CustomSection(props: { word: Word; section: WordSection }) {
  const { section } = props;
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">{section.title}</h3>
      <div className="text-pretty text-sm">
        {parseHtml(section.customSection?.text ?? "")}
      </div>
    </div>
  );
}

function SortableSection(props: {
  section: WordSection;
  word: Word;
  isUpdating: boolean;
  totalSections: number;
  index: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.section.id, disabled: props.isUpdating });

  const [isEditing, setIsEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : props.isUpdating ? 0.7 : 1,
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/section relative flex items-start gap-2",
        props.isUpdating ? "cursor-wait" : "",
      )}
    >
      {props.totalSections > 1 && (
        <div className="flex h-full items-center gap-1">
          {isMobile ? (
            <div className="flex h-full flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-1"
                onClick={props.onMoveUp}
                disabled={props.index === 0 || props.isUpdating}
              >
                <ChevronUpIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-1"
                onClick={props.onMoveDown}
                disabled={
                  props.index === props.totalSections - 1 || props.isUpdating
                }
              >
                <ChevronDownIcon className="size-5" />
              </Button>
            </div>
          ) : (
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "flex h-full items-center p-2 text-muted-foreground hover:text-foreground",
                props.isUpdating ? "cursor-wait" : "cursor-grab",
              )}
            >
              <GripVerticalIcon className="size-4" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1">
        {isEditing ? (
          <EditSectionForm
            section={props.section}
            afterSubmit={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            {props.section?.definitionSection ? (
              <DefinitionSection section={props.section} word={props.word} />
            ) : (
              <CustomSection section={props.section} word={props.word} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SortableLexicalSection(props: {
  section: LexicalSection;
  isUpdating: boolean;
  totalSections: number;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.section.id, disabled: props.isUpdating });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : props.isUpdating ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/section relative flex items-start gap-2",
        props.isUpdating ? "cursor-wait" : "",
      )}
    >
      {props.totalSections > 1 && (
        <div className="flex h-full items-center gap-1">
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "flex h-full items-center p-2 text-muted-foreground hover:text-foreground",
              props.isUpdating ? "cursor-wait" : "cursor-grab",
            )}
          >
            <GripVerticalIcon className="size-4" />
          </div>
        </div>
      )}
      <div className="flex-1">
        {/* Placeholder for section content */}
        <div className="rounded border bg-muted/30 p-3">
          <strong>{props.section.sectionType}</strong> section (ID:{" "}
          {props.section.id})
        </div>
      </div>
    </div>
  );
}

export function WordViewEdit(props: { word: Word }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const lexicalSectionsRaw = props.word.lexicalSections ?? [];
  const {
    sections: lexicalSections,
    sensors,
    handleDragEnd: lexicalHandleDragEnd,
  } = useSortableLexicalSections(lexicalSectionsRaw);

  function handleExitEditMode() {
    // Create new URLSearchParams object from the current params
    const newParams = new URLSearchParams(searchParams.toString());
    // Remove the edit param
    newParams.delete("edit");
    // Push the new URL
    router.push(`?${newParams.toString()}`);
  }

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
            <DeleteWord
              word={props.word}
              afterDelete={() =>
                router.push(`/lang/${props.word.conlangId}/?view=lexicon`)
              }
            />
          </div>
          {lexicalSections.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-8 md:flex"
              onClick={handleExitEditMode}
            >
              <ArrowTurnLeft className="mr-2 size-4" /> Return
            </Button>
          )}
        </div>
      )}
      <Separator />
      <div id="word-sections" className="my-2">
        <div id="add-new-section">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="md:h-8">
                <PlusIcon className="mr-1 size-4 text-green-600" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-lg p-0">
              <AddSectionForm
                onSectionAdded={() => {
                  alert("not implemented");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={lexicalHandleDragEnd}
        >
          <SortableContext
            items={lexicalSections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="my-2 flex flex-col gap-2">
              {lexicalSections.map((section, index) => (
                <SortableLexicalSection
                  key={section.id}
                  section={section}
                  isUpdating={false}
                  totalSections={lexicalSections.length}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {lexicalSections.length > 0 && (
        <Button
          variant="outline"
          size="lg"
          className="mb-4 flex h-8 md:mb-0 md:hidden"
          onClick={handleExitEditMode}
        >
          <ArrowTurnLeft className="mr-2 size-4" /> Return
        </Button>
      )}
    </div>
  );
}

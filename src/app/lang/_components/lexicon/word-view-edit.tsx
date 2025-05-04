"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowTurnLeft } from "~/components/icons/arrow-turn-left";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type LexicalSection, type Word } from "~/types/word";
import { updateSectionOrders } from "../../_actions/word";
import { AddSectionDialog } from "./forms/add-section";
import { DeleteSection } from "./forms/delete-section";
import { DeleteWord } from "./forms/delete-word";
import { EditWordButton, EditWordForm } from "./forms/edit-word";
import { renderSection } from "./section-views";

/** Editable WordView */
export function WordViewEdit(props: { word: Word }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    sections: lexicalSections,
    sensors,
    handleDragEnd: lexicalHandleDragEnd,
    handleMove,
    isUpdating,
  } = useSortableSections(props.word);

  function handleExitEditMode() {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("edit");
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
          <AddSectionDialog
            word={props.word}
            onSectionAdded={() => {
              router.refresh();
            }}
          />
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
                <SortableSection
                  key={section.id}
                  section={section}
                  isUpdating={isUpdating}
                  totalSections={lexicalSections.length}
                  index={index}
                  onMoveUp={() => handleMove(index, "up")}
                  onMoveDown={() => handleMove(index, "down")}
                  wordText={props.word.text}
                  onSectionDeleted={() => router.refresh()}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {props.word.lexicalSections.length === 0 && (
        <div className="my-2">
          <p className="text-sm text-muted-foreground">
            Add a Definition, Pronunciation, or other Section using the button
            above!
          </p>
        </div>
      )}
      {lexicalSections.length > 0 && (
        <Button
          variant="outline"
          size="lg"
          className="mb-4 flex h-8 md:mb-0 md:hidden"
          onClick={handleExitEditMode}
        >
          <ArrowTurnLeft className="mr-2 size-4" /> Exit Edit Mode
        </Button>
      )}
    </div>
  );
}

/** Holds a lexicalSection and handles sorting, edit, and content display */
function SortableSection(props: {
  section: LexicalSection;
  isUpdating: boolean;
  totalSections: number;
  index: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  wordText?: string;
  onSectionDeleted?: () => void;
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
        "group/section relative flex items-start gap-2 rounded border bg-muted/30 p-2",
        props.isUpdating ? "cursor-wait" : "",
      )}
    >
      <div className="absolute right-2 top-2 z-10">
        <DeleteSection
          section={props.section}
          wordText={props.wordText ?? ""}
          afterDelete={props.onSectionDeleted}
        />
      </div>
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
                props.isUpdating
                  ? "pointer-events-none cursor-wait opacity-50"
                  : "cursor-grab",
              )}
              tabIndex={props.isUpdating ? -1 : 0}
              aria-disabled={props.isUpdating}
            >
              <GripVerticalIcon className="size-4" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1">
        {/* Placeholder for section content */}
        {renderSection(props.section)}
      </div>
    </div>
  );
}

/** Hook to handle section sorting events */
function useSortableSections(word: Word) {
  const [sections, setSections] = useState<LexicalSection[]>(
    word.lexicalSections ?? [],
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Update sections when word changes
  useEffect(() => {
    setSections(word.lexicalSections ?? []);
  }, [word.lexicalSections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const reorderSections = useCallback(
    async (activeId: string, overId: string) => {
      setIsUpdating(true);

      // Create a map of current sections for quick lookup
      const sectionMap = new Map(sections.map((s) => [s.id, s]));
      const activeSection = sectionMap.get(activeId);
      const overSection = sectionMap.get(overId);

      if (!activeSection || !overSection) {
        setIsUpdating(false);
        return;
      }

      // Find the indices of the active and over sections
      const activeIndex = sections.findIndex((s) => s.id === activeId);
      const overIndex = sections.findIndex((s) => s.id === overId);

      // Create new array with sections in their new positions
      const newSections = [...sections];
      const movedSection = newSections[activeIndex];
      if (!movedSection) {
        console.error("Failed to find moved section at index:", activeIndex);
        setIsUpdating(false);
        return;
      }
      newSections.splice(activeIndex, 1);
      newSections.splice(overIndex, 0, movedSection);

      // Update all sections with new order numbers based on their final position
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1,
      }));

      // Optimistically update the UI
      setSections(updatedSections);

      try {
        await updateSectionOrders(
          updatedSections.map((section) => ({
            id: section.id,
            order: section.order,
          })),
        );
        router.refresh();
      } catch (error) {
        setSections(sections);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [sections, router],
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    try {
      await reorderSections(String(active.id), String(over.id));
    } catch (error) {
      toast.error("Failed to reorder sections. Please try again.");
    }
  };

  // For mobile reordering
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up") {
      await handleMoveUp(index);
    } else {
      await handleMoveDown(index);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentSection = sections[index];
    const targetSection = sections[index - 1];
    if (!currentSection || !targetSection) return;

    try {
      await reorderSections(currentSection.id, targetSection.id);
    } catch (error) {
      toast.error("Failed to move section up. Please try again.");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const currentSection = sections[index];
    const targetSection = sections[index + 1];
    if (!currentSection || !targetSection) return;

    try {
      await reorderSections(currentSection.id, targetSection.id);
    } catch (error) {
      toast.error("Failed to move section down. Please try again.");
    }
  };

  return {
    sections,
    isUpdating,
    sensors,
    handleDragEnd,
    handleMove,
    reorderSections,
  };
}

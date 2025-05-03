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
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  PlusIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowTurnLeft } from "~/components/icons/arrow-turn-left";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type LexicalSection, type Word } from "~/types/word";
import { AddSectionForm } from "./add-section";
import { DeleteWord } from "./delete-word";
import { EditWordButton, EditWordForm } from "./edit-word";

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
  } = useSortableSections(props.word);

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
                word={props.word}
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
                  onMoveUp={() => handleMove(index, "up")}
                  onMoveDown={() => handleMove(index, "down")}
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

/** Holds a lexicalSection and handles sorting, edit, and content display */
function SortableLexicalSection(props: {
  section: LexicalSection;
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
        {/* Placeholder for section content */}
        <div className="p-3">
          <strong>{props.section.sectionType}</strong> section (ID:{" "}
          {props.section.id})
        </div>
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
        // TODO: Send updates to server for lexicalSections order
        // await updateSectionOrders(
        //   updatedSections.map((section) => ({
        //     id: section.id,
        //     order: section.order,
        //   })),
        // );
        // router.refresh();
      } catch (error) {
        setSections(sections);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [sections],
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

import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateSectionOrders } from "~/app/lang/_actions/word";
import { type Word, type WordSection } from "~/types/word";

export function useSortableSections(word: Word) {
  const [sections, setSections] = useState<WordSection[]>(word.wordSections);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Update sections when word changes
  useEffect(() => {
    setSections(word.wordSections);
  }, [word.wordSections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    try {
      await reorderSections(Number(active.id), Number(over.id));
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

  const reorderSections = useCallback(
    async (activeId: number, overId: number) => {
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
        // Send updates to server using the same order values
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

  return {
    sections,
    isUpdating,
    sensors,
    handleDragEnd,
    handleMove,
    reorderSections,
  };
}

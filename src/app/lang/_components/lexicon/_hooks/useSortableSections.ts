import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Word } from "~/types/word";
import { updateSectionOrders } from "../../../_actions/word";

export function useSortableSections(word: Word) {
  const [sections, setSections] = useState(word.wordSections);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      setIsUpdating(true);
      const oldIndex = sections.findIndex(
        (section) => section.id === active.id,
      );
      const newIndex = sections.findIndex((section) => section.id === over.id);

      // Update local state immediately for better UX
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update all section orders based on the new client state
      const updates = newSections.map((section, index) => ({
        id: section.id,
        order: index,
      }));

      await updateSectionOrders(updates);

      // Refresh to get the latest data
      router.refresh();
    } catch (error) {
      console.error("Error updating section order:", error);
      // Revert to the original order if the update fails
      setSections(word.wordSections);
    } finally {
      setIsUpdating(false);
    }
  }

  // Update local state when props change
  useEffect(() => {
    // Only update if the sections have actually changed
    const currentIds = sections.map((s) => s.id).sort();
    const newIds = word.wordSections.map((s) => s.id).sort();
    if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
      setSections(word.wordSections);
    }
  }, [word.wordSections, sections]);

  return {
    sections,
    isUpdating,
    sensors,
    handleDragEnd,
  };
}

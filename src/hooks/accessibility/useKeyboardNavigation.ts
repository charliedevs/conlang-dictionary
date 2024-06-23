import { useEffect, useState, type RefObject } from "react";
import { useEventListener } from "usehooks-ts";

export function useKeyboardNavigation(
  itemCount: number,
  itemIdPrefix = "item",
  containerRef: RefObject<HTMLElement>,
) {
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedItemIndex((prevIndex) =>
        prevIndex < itemCount - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedItemIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex,
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedItemIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedItemIndex(itemCount - 1);
    }
  };
  useEventListener("keydown", handleKeyDown, containerRef);

  useEffect(() => {
    const focusedItem = document.getElementById(
      `${itemIdPrefix}-${focusedItemIndex}`,
    );
    if (focusedItem) {
      focusedItem.focus();
    }
  }, [focusedItemIndex, itemIdPrefix]);

  return { focusedItemIndex, setFocusedItemIndex };
}

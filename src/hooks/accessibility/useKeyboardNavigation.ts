import { useEffect, useState } from "react";

export function useKeyboardNavigation(
  itemCount: number,
  itemIdPrefix = "item",
) {
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);

  useEffect(() => {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [itemCount]);

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

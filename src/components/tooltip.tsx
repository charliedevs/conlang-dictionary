"use client";

import type { ReactNode } from "react";
import { TooltipContent, TooltipRoot, TooltipTrigger } from "./ui/tooltip";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Easy to use Tooltip component.
 *
 * Usage:
 *
 * <Tooltip content="Tooltip text" side="right">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * - `children`: The trigger element for the tooltip (required).
 * - `content`: The tooltip content (ReactNode, required).
 * - `side`: Tooltip placement relative to the trigger (optional, defaults to top; accepts 'top', 'right', 'bottom', 'left').
 *
 * This component uses shadcn (Radix) Tooltip under the hood and is globally wrapped in TooltipProvider.
 */
export function Tooltip({ children, content, side }: TooltipProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
}

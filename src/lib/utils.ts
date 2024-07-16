import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Safely merge class names with tailwind-merge and clsx
 * @param inputs list of class values to merge
 * @example cn("flex flex-col", condition && "gap-4")
 * @returns
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import useMediaQuery from "./useMediaQuery";

/**
 * Hook to determine if the current viewport is considered mobile.
 *
 * @param maxWidth - The max width in px to consider as mobile (default: 768).
 * @returns {boolean} - True if the viewport is mobile.
 *
 * Usage:
 *   const isMobile = useIsMobile();
 *   const isCustomMobile = useIsMobile(600);
 */
export default function useIsMobile(maxWidth: number = 768): boolean {
  return useMediaQuery(`(max-width: ${maxWidth}px)`);
}

import { Github } from "~/components/icons/github";
import { FeedbackDialog } from "./feedback-dialog";

const FOUNDING_YEAR = 2024;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightYears =
    currentYear > FOUNDING_YEAR
      ? `${FOUNDING_YEAR}–${currentYear}`
      : `${FOUNDING_YEAR}`;

  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-2 px-3 pb-3 pt-4 text-center text-xs text-muted-foreground md:flex-row md:items-end md:justify-between md:gap-0 md:px-6 md:text-sm">
      <p className="text-center md:text-left">
        © {copyrightYears}{" "}
        <a
          href="https://charliedevs.com"
          target="_blank"
          className="hover:underline hover:opacity-85"
        >
          Charlie Davis
        </a>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
        <a
          href="https://github.com/charliedevs/conlang-dictionary"
          target="_blank"
          className="flex items-center gap-1 whitespace-nowrap hover:underline hover:opacity-85"
        >
          <Github className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">View source code on </span>
          GitHub
        </a>
        <FeedbackDialog />
      </div>
    </footer>
  );
}

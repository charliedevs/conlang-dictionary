import { Github } from "~/components/icons/github";

export function Footer() {
  return (
    <footer className="mt-auto flex w-full items-end justify-between px-3 pb-2 pt-4 text-center text-xs text-muted-foreground md:px-6 md:text-sm">
      <p className="text-left">
        © 2024–2025{" "}
        <a
          href="https://charliedevs.com"
          target="_blank"
          className="hover:underline hover:opacity-85"
        >
          Charlie Davis
        </a>
      </p>
      <div className="flex justify-end gap-3">
        <a
          href="https://github.com/charliedevs/conlang-dictionary"
          target="_blank"
          className="flex items-center gap-1 hover:underline hover:opacity-85"
        >
          <Github className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">View source code on </span>
          GitHub
        </a>
        |
        <a
          href="https://github.com/charliedevs/conlang-dictionary/issues"
          target="_blank"
          className="hover:underline hover:opacity-85"
        >
          Report an issue
        </a>
      </div>
    </footer>
  );
}

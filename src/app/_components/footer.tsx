export function Footer() {
  return (
    <footer className="flex w-full items-end justify-between px-6 py-2 text-center text-sm text-muted-foreground">
      <a
        href="https://github.com/charliedevs/conlang-dictionary"
        className=" hover:underline hover:opacity-85"
      >
        View source code on GitHub
      </a>
      <a
        href="https://github.com/charliedevs/conlang-dictionary/issues"
        className="hover:underline hover:opacity-85"
      >
        Report an issue
      </a>
    </footer>
  );
}

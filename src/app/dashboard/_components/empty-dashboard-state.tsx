import { Language } from "~/components/icons/language";
import { ImportConlangDialog } from "./import-conlang-dialog";

export function EmptyDashboardState() {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent">
        <Language className="size-7 text-foreground/70" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight">
          Every language starts with a blank page.
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Give yours a name below, then fill in words, sounds, and grammar
          whenever you&apos;re ready.
        </p>
      </div>
      <ImportConlangDialog />
    </div>
  );
}

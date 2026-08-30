"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { missingDefaultCategories } from "~/lib/lexical-categories/defaults";
import { cn } from "~/lib/utils";
import {
  createLexicalCategories,
  createLexicalCategory,
} from "~/server/actions/lexical-category";

/**
 * One-click chips for the common parts of speech a conlang doesn't have yet,
 * plus an "Add all". Renders nothing once every default is present. Reused in
 * the empty state, the add dialog, and the add-word category picker; the parent
 * supplies `onAdded` to refresh its own view after a change.
 */
export function LexicalCategorySuggestions(props: {
  conlangId: number;
  existing: string[];
  onAdded?: () => void;
  className?: string;
}) {
  const missing = missingDefaultCategories(props.existing);
  const [busyName, setBusyName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (missing.length === 0) return null;

  const run = (name: string, action: () => Promise<unknown>, done: string) => {
    setBusyName(name);
    startTransition(async () => {
      try {
        await action();
        toast.success(done);
        if (props.onAdded) props.onAdded();
        else router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't add that. Please try again.",
        );
      } finally {
        setBusyName(null);
      }
    });
  };

  const addOne = (name: string) =>
    run(
      name,
      () => createLexicalCategory({ conlangId: props.conlangId, category: name }),
      `${name} added.`,
    );

  const addAll = () =>
    run(
      "__all__",
      async () => {
        const created = await createLexicalCategories(props.conlangId, missing);
        return created;
      },
      missing.length === 1
        ? "1 part of speech added."
        : `${missing.length} parts of speech added.`,
    );

  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Suggested parts of speech
        </span>
        {missing.length > 1 && (
          <button
            type="button"
            onClick={addAll}
            disabled={isPending}
            className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {busyName === "__all__" ? "Adding…" : "Add all"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {missing.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => addOne(name)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm capitalize transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <PlusIcon className="size-3.5 text-muted-foreground" />
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { missingDefaultCategories } from "~/lib/lexical-categories/defaults";
import { createLexicalCategory } from "~/server/actions/lexical-category";
import { LexicalCategorySuggestions } from "./lexical-category-suggestions";

/**
 * Owner-only affordance to add a lexical category from the grammar surface. It
 * renders its own trigger button (configured by serializable props so a Server
 * Component can drop it in) which opens a dialog offering a free-text field
 * plus the missing-default suggestions.
 */
export function AddLexicalCategory(props: {
  conlangId: number;
  existing: string[];
  triggerLabel: string;
  triggerVariant?: "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const created = await createLexicalCategory({
          conlangId: props.conlangId,
          category: trimmed,
        });
        toast.success(`${created.category} added.`);
        setName("");
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Couldn't add that part of speech. Please try again.",
        );
      }
    });
  };

  return (
    <>
      <Button
        variant={props.triggerVariant ?? "outline"}
        size="sm"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="mr-1.5 size-4" />
        {props.triggerLabel}
      </Button>
      <DialogDrawer
        open={open}
        onClose={() => {
          setOpen(false);
          setName("");
        }}
        title="Add part of speech"
        description="A lexical category — like noun, verb, or adjective — you can assign to a word's definitions."
        content={
          <div className="flex flex-col gap-4 md:pt-2">
            <div className="flex flex-col gap-2">
              <Input
                autoFocus
                placeholder="New part of speech…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                }}
                disabled={isPending}
              />
              <Button onClick={save} disabled={!name.trim() || isPending}>
                Add
              </Button>
            </div>
            {missingDefaultCategories(props.existing).length > 0 && (
              <div className="flex flex-col gap-4">
                <Separator />
                <LexicalCategorySuggestions
                  conlangId={props.conlangId}
                  existing={props.existing}
                  onAdded={() => router.refresh()}
                />
              </div>
            )}
          </div>
        }
      />
    </>
  );
}

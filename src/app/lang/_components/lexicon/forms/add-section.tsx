"use client";

import {
  ArrowLeftIcon,
  BookOpenIcon,
  FileTextIcon,
  InfoIcon,
  ListIcon,
  PlusIcon,
  Volume2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createLexicalSection } from "~/app/lang/_actions/word";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { type InsertLexicalSectionInput } from "~/server/mutations";
import { type SectionType, type Word } from "~/types/word";
import { DefinitionSectionForm } from "./definition-section-form";

export const SECTION_TYPE_UI: Record<
  SectionType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  definition: {
    label: "Definition",
    icon: BookOpenIcon,
    description: "Add meaning and lexical category.",
  },
  pronunciation: {
    label: "Pronunciation",
    icon: Volume2Icon,
    description: "Add IPA, audio, and region.",
  },
  etymology: {
    label: "Etymology",
    icon: InfoIcon,
    description: "Add word origin and history.",
  },
  custom_text: {
    label: "Custom Text",
    icon: FileTextIcon,
    description: "Add a custom text section.",
  },
  custom_fields: {
    label: "Custom Fields",
    icon: ListIcon,
    description: "Add custom key-value fields.",
  },
};

const SECTION_TYPES = (Object.keys(SECTION_TYPE_UI) as SectionType[]).map(
  (type) => ({
    type,
    ...SECTION_TYPE_UI[type],
  }),
);

type SectionTypeOption = (typeof SECTION_TYPES)[number];

type SectionTypeValue = SectionTypeOption["type"];

export function AddSectionDialog({
  word,
  onSectionAdded,
}: {
  word: Word;
  onSectionAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full text-lg md:h-8 md:w-fit md:text-sm"
        >
          <PlusIcon className="mr-1 size-4 text-green-600" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg p-0">
        <AddSectionForm
          word={word}
          onSectionAdded={() => {
            setOpen(false);
            onSectionAdded?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export function AddSectionForm({
  word,
  onCancel,
  onSectionAdded,
}: {
  word: Word;
  onCancel?: () => void;
  onSectionAdded?: () => void;
}) {
  const [selectedType, setSelectedType] = useState<SectionTypeValue | null>(
    null,
  );

  const router = useRouter();
  async function handleSubmit(section: InsertLexicalSectionInput) {
    try {
      await createLexicalSection(section);
      onSectionAdded?.();
      router.refresh();
      toast.success(
        `${SECTION_TYPE_UI[section.sectionType].label} section added`,
      );
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add definition section. Please try again.");
      }
      return;
    }
  }

  if (selectedType === null) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="mb-1 text-xl font-semibold">Add a Section</h2>
        <div className="mb-1 text-lg font-medium text-muted-foreground">
          For: <span className="text-foreground">{word.text}</span>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SECTION_TYPES.map(({ type, label, icon: Icon, description }) => (
            <Button
              key={type}
              variant="outline"
              className="flex h-auto min-h-24 flex-col items-start gap-1 border-2 border-muted p-4 text-left hover:border-primary"
              onClick={() => setSelectedType(type)}
            >
              <div className="mb-1 flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-base font-bold">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </Button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  const selected = SECTION_TYPES.find((s) => s.type === selectedType);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="mb-1 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedType(null)}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Add {selected?.label} Section</h2>
      </div>
      <div className="mb-1 text-lg font-medium text-muted-foreground">
        For: <span className="text-foreground">{word.text}</span>
      </div>
      <Separator />
      <div className="">
        <SectionFormSwitcher
          sectionType={selectedType}
          word={word}
          onSectionFormSubmit={handleSubmit}
          onCancel={() => setSelectedType(null)}
        />
      </div>
      <div className="mt-4 flex justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function SectionFormSwitcher({
  sectionType,
  word,
  onSectionFormSubmit,
  onCancel,
}: {
  sectionType: SectionTypeValue;
  word: Word;
  onSectionFormSubmit: (section: InsertLexicalSectionInput) => void;
  onCancel?: () => void;
}) {
  switch (sectionType) {
    case "definition":
      return (
        <DefinitionSectionForm
          word={word}
          mode="add"
          onCancel={onCancel}
          onSubmit={(values) =>
            onSectionFormSubmit({
              sectionType: "definition",
              wordId: word.id,
              properties: values,
            })
          }
        />
      );
    case "pronunciation":
      return <div>[Pronunciation Section Form goes here]</div>;
    case "etymology":
      return <div>[Etymology Section Form goes here]</div>;
    case "custom_text":
      return <div>[Custom Text Section Form goes here]</div>;
    case "custom_fields":
      return <div>[Custom Fields Section Form goes here]</div>;
    default:
      return <div>Unknown section type</div>;
  }
}

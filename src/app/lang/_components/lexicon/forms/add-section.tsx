"use client";

import {
  ArrowLeftIcon,
  BookOpenIcon,
  FileTextIcon,
  InfoIcon,
  ListIcon,
  Volume2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
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

  if (selectedType === null) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="mb-1 text-xl font-semibold">Add a Section</h2>
        <div className="mb-2 text-lg font-medium text-muted-foreground">
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
      <div className="mb-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedType(null)}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Add {selected?.label} Section</h2>
      </div>
      <div className="mb-2 text-lg font-medium text-muted-foreground">
        For: <span className="text-foreground">{word.text}</span>
      </div>
      <Separator />
      <div className="rounded border bg-muted/30 p-4">
        <SectionFormSwitcher
          sectionType={selectedType}
          word={word}
          onSectionAdded={onSectionAdded}
          onCancel={() => setSelectedType(null)}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={() => setSelectedType(null)}>
          Change Section Type
        </Button>
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
  onSectionAdded,
  onCancel,
}: {
  sectionType: SectionTypeValue;
  word: Word;
  onSectionAdded?: () => void;
  onCancel?: () => void;
}) {
  switch (sectionType) {
    case "definition":
      return (
        <DefinitionSectionForm
          word={word}
          mode="add"
          onCancel={onCancel}
          onSubmit={(values) => {
            // For now, just log the values
            console.log("DefinitionSectionForm submitted", values);
            onSectionAdded?.();
          }}
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

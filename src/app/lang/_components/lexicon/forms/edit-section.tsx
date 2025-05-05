import { Edit2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import type { UpdateLexicalSectionPropertiesInput } from "~/server/mutations";
import { type LexicalSection, type Word } from "~/types/word";
import { editLexicalSectionProperties } from "../../../_actions/word";
import { CustomTextSectionForm } from "./custom-text-section-form";
import { DefinitionSectionForm } from "./definition-section-form";
import { EtymologySectionForm } from "./etymology-section-form";
import { PronunciationSectionForm } from "./pronunciation-section-form";

export function EditSection({
  section,
  word,
  afterEdit,
}: {
  section: LexicalSection;
  word: Word;
  afterEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  async function handleSubmit(input: UpdateLexicalSectionPropertiesInput) {
    setIsSaving(true);
    try {
      await editLexicalSectionProperties(section.id, input);
      toast.success("Section updated");
      setOpen(false);
      if (afterEdit) afterEdit();
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-6 p-1 text-muted-foreground hover:bg-blue-700/10 group-hover/section:text-blue-700"
          onClick={handleOpen}
        >
          <span className="sr-only">Edit section</span>
          <Edit2Icon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg p-0">
        <div className="flex flex-col gap-4 p-4">
          <DialogHeader>
            <DialogTitle>Edit {section.sectionType} Section</DialogTitle>
          </DialogHeader>
          <div className="mb-1 text-lg font-medium text-muted-foreground">
            For: <span className="text-foreground">{word.text}</span>
          </div>
          <Separator />
          <SectionFormSwitcher
            section={section}
            word={word}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionFormSwitcher({
  section,
  word,
  isSaving,
  onSubmit,
  onCancel,
}: {
  section: LexicalSection;
  word: Word;
  isSaving: boolean;
  onSubmit: (input: UpdateLexicalSectionPropertiesInput) => void;
  onCancel: () => void;
}) {
  switch (section.sectionType) {
    case "definition":
      return (
        <DefinitionSectionForm
          word={word}
          mode="edit"
          initialValues={section.properties}
          onSubmit={(values) =>
            onSubmit({
              sectionType: "definition",
              properties: values,
            })
          }
          onCancel={onCancel}
          disabled={isSaving}
        />
      );
    case "pronunciation":
      return (
        <PronunciationSectionForm
          word={word}
          mode="edit"
          initialValues={section.properties}
          onSubmit={(values) =>
            onSubmit({
              sectionType: "pronunciation",
              properties: values,
            })
          }
          onCancel={onCancel}
          disabled={isSaving}
        />
      );
    case "etymology":
      return (
        <EtymologySectionForm
          word={word}
          mode="edit"
          initialValues={section.properties}
          onSubmit={(values) =>
            onSubmit({
              sectionType: "etymology",
              properties: values,
            })
          }
          onCancel={onCancel}
          disabled={isSaving}
        />
      );
    case "custom_text":
      return (
        <CustomTextSectionForm
          word={word}
          mode="edit"
          initialValues={section.properties}
          onSubmit={(values) =>
            onSubmit({
              sectionType: "custom_text",
              properties: values,
            })
          }
          onCancel={onCancel}
          disabled={isSaving}
        />
      );
    // TODO: Add other section types as forms are implemented
    default:
      return <div>Editing this section type is not yet supported.</div>;
  }
}

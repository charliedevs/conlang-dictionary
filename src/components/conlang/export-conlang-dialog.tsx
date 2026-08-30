"use client";

import { FileJson, FileText } from "lucide-react";
import { type MouseEvent } from "react";
import { toast } from "sonner";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import { downloadConlangExport } from "~/lib/conlang-export/trigger-download";

const EXPORT_FORMATS = [
  {
    format: "json" as const,
    label: "JSON",
    description:
      "A complete backup of every word, definition, and tag — the format to re-import this conlang here or into another account.",
    icon: FileJson,
  },
  {
    format: "markdown" as const,
    label: "Markdown",
    description:
      "A readable document of your lexicon — for sharing, printing, or reading offline. Not re-importable.",
    icon: FileText,
  },
];

export function ExportConlangDialog(props: {
  conlangId: number;
  conlangName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function handleExport(format: "json" | "markdown", e: MouseEvent) {
    // Rendered inside the conlang table row's React tree (though it portals
    // out in the DOM), so an unstopped click here still bubbles through
    // React's synthetic events to the row's onClick and navigates away.
    e.stopPropagation();
    try {
      await downloadConlangExport(props.conlangId, format);
      props.onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    }
  }

  return (
    <DialogDrawer
      open={props.open}
      onClose={() => props.onOpenChange(false)}
      title={`Export ${props.conlangName}`}
      description="Choose a format to download."
      content={
        <div className="mt-4 flex flex-col gap-4">
          {EXPORT_FORMATS.map(({ format, label, description, icon: Icon }) => (
            <button
              key={format}
              type="button"
              onClick={(e) => void handleExport(format, e)}
              className="flex items-start gap-3 rounded-md border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">
                  {description}
                </span>
              </div>
            </button>
          ))}
        </div>
      }
    />
  );
}

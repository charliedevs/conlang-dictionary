"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  parseConlangImport,
  type ImportParseResult,
} from "~/lib/conlang-export/parse-import";
import {
  handleApiErrorResponse,
  isApiError,
} from "~/utils/client-error-handler";

function ImportPreview({
  result,
  conlangName,
  onConlangNameChange,
  nameError,
  isSubmitting,
  onSubmit,
}: {
  result: ImportParseResult;
  conlangName: string;
  onConlangNameChange: (name: string) => void;
  nameError: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  if (!result.ok) {
    return <p className="text-sm text-destructive">{result.error}</p>;
  }

  const { wordCount, categoryCount } = result.summary;
  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="import-conlang-name">Conlang name</Label>
        <Input
          id="import-conlang-name"
          value={conlangName}
          onChange={(e) => onConlangNameChange(e.target.value)}
        />
        {nameError && (
          <p className="text-sm text-destructive">{nameError}</p>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {wordCount} word{wordCount === 1 ? "" : "s"}, {categoryCount}{" "}
        categor{categoryCount === 1 ? "y" : "ies"}
      </p>
      <Button
        disabled={isSubmitting || conlangName.trim().length === 0}
        onClick={onSubmit}
      >
        {isSubmitting ? "Importing..." : "Import"}
      </Button>
    </div>
  );
}

export function ImportConlangDialog() {
  const router = useRouter();
  const [result, setResult] = useState<ImportParseResult | null>(null);
  const [conlangName, setConlangName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFileSelected(file: File) {
    const text = await file.text();
    const parsed = parseConlangImport(text, file.size);
    setResult(parsed);
    setConlangName(parsed.ok ? parsed.data.conlang.name : "");
    setNameError(null);
  }

  function reset() {
    setResult(null);
    setConlangName("");
    setNameError(null);
  }

  async function handleImport() {
    if (!result?.ok) return;
    setIsSubmitting(true);
    setNameError(null);
    try {
      const res = await fetch("/api/conlang/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conlangName, data: result.data }),
      });
      if (!res.ok) {
        await handleApiErrorResponse(res);
        return;
      }
      const { conlang } = (await res.json()) as { conlang: { id: number } };
      toast.success("Conlang imported.");
      router.push(`/lang/${conlang.id}`);
    } catch (error) {
      if (isApiError(error) && error.code === "DUPLICATE_CONLANG_NAME") {
        setNameError("A conlang with this name already exists.");
      } else {
        toast.error(
          error instanceof Error ? error.message : "Import failed.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogDrawer
      trigger={<Button variant="outline">Import a conlang</Button>}
      title="Import a conlang"
      description="Upload a conlang export file (.json) to bring it into this account."
      onClose={reset}
      content={
        <div className="flex flex-col gap-4">
          <Input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelected(file);
            }}
          />
          {result && (
            <ImportPreview
              result={result}
              conlangName={conlangName}
              onConlangNameChange={(name) => {
                setConlangName(name);
                setNameError(null);
              }}
              nameError={nameError}
              isSubmitting={isSubmitting}
              onSubmit={() => void handleImport()}
            />
          )}
        </div>
      }
    />
  );
}

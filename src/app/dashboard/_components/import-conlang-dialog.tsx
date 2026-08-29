"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { DialogDrawer } from "~/components/ui/dialog-drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  parseConlangImport,
  type ImportParseResult,
} from "~/lib/conlang-export/parse-import";

function ImportPreview({
  result,
  conlangName,
  onConlangNameChange,
}: {
  result: ImportParseResult;
  conlangName: string;
  onConlangNameChange: (name: string) => void;
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
      </div>
      <p className="text-sm text-muted-foreground">
        {wordCount} word{wordCount === 1 ? "" : "s"}, {categoryCount}{" "}
        categor{categoryCount === 1 ? "y" : "ies"}
      </p>
      <Button disabled>Import</Button>
      <p className="text-xs text-muted-foreground">
        Creating the conlang from this file lands in the next step.
      </p>
    </div>
  );
}

export function ImportConlangDialog() {
  const [result, setResult] = useState<ImportParseResult | null>(null);
  const [conlangName, setConlangName] = useState("");

  async function handleFileSelected(file: File) {
    const text = await file.text();
    const parsed = parseConlangImport(text, file.size);
    setResult(parsed);
    setConlangName(parsed.ok ? parsed.data.conlang.name : "");
  }

  function reset() {
    setResult(null);
    setConlangName("");
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
              onConlangNameChange={setConlangName}
            />
          )}
        </div>
      }
    />
  );
}

"use client";

import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ExportConlangDialog } from "~/components/conlang/export-conlang-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ConlangSettingsMenu(props: {
  conlangId: number;
  conlangName: string;
}) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const { conlangId, conlangName } = props;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Settings for {conlangName}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem
            onClick={() => router.push(`/lang/edit/${conlangId}`)}
          >
            <Pencil className="mr-2 h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span>Edit Details</span>
              <span className="text-xs text-muted-foreground">
                Name, emoji &amp; description
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-4 w-4 shrink-0" />
            <span>Export</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Trash2 className="mr-2 h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span>Delete</span>
              <span className="text-xs text-muted-foreground">
                Coming soon
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportConlangDialog
        conlangId={conlangId}
        conlangName={conlangName}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </>
  );
}

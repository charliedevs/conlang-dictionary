"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EllipsisHorizontal } from "~/components/icons/ellipsis-horizontal";
import { Pencil } from "~/components/icons/pencil";
import { Trash } from "~/components/icons/trash";
import { ExportConlangDialog } from "~/components/conlang/export-conlang-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Settings for {conlangName}</span>
            <EllipsisHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{conlangName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/lang/edit/${conlangId}`)}
          >
            <Pencil className="mr-2 h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span>Edit Details</span>
              <span className="text-xs text-muted-foreground">
                Name, emoji & description
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => alert("Delete not implemented")}
            className="text-red-700 focus:bg-red-800/10 focus:text-red-700"
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
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

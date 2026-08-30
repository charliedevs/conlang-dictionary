"use client";

import {
  type ColumnDef,
  type Row as RowType,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ArrowRightCircle } from "~/components/icons/arrow-right-circle";
import { Eye } from "~/components/icons/eye";
import { EyeSlash } from "~/components/icons/eye-slash";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useUsers } from "~/hooks/data/useUsers";
import { cn } from "~/lib/utils";
import { ExportConlangDialog } from "~/components/conlang/export-conlang-dialog";
import { type Conlang } from "~/types/conlang";

export const dynamic = "force-dynamic";

function RowActions(props: { conlangId: number; conlangName: string }) {
  const router = useRouter();
  const [exportOpen, setExportOpen] = useState(false);
  const { conlangId, conlangName } = props;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Actions for {conlangName}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{conlangName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/lang/${conlangId}`);
            }}
          >
            <FileText className="mr-2 h-4 w-4 shrink-0" />
            <span>View</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/lang/edit/${conlangId}`);
            }}
          >
            <Pencil className="mr-2 h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span>Edit Details</span>
              <span className="text-xs text-muted-foreground">
                Name, emoji &amp; description
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setExportOpen(true);
            }}
          >
            <Download className="mr-2 h-4 w-4 shrink-0" />
            <span>Export</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled onClick={(e) => e.stopPropagation()}>
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

export function ConlangTable(props: {
  conlangs: Conlang[];
  visibility?: VisibilityState;
  className?: string;
}) {
  const router = useRouter();
  const { data: userList, isLoading } = useUsers({
    userId: props.conlangs.map((conlang) => conlang.ownerId),
  });

  const columns: ColumnDef<Conlang>[] = useMemo(
    () => [
      {
        accessorKey: "emoji",
        header: "",
        cell: ({ row }) => (
          <div className="max-w-4 text-nowrap">{row.original.emoji}</div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "ownerId",
        header: "Creator",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isLoading ? (
              <>
                <div className="h-6 w-6 rounded-full bg-slate-300" />
                Loading ...
              </>
            ) : userList && userList.length > 0 ? (
              <>
                <Image
                  src={
                    userList.find((user) => user.id === row.original.ownerId)
                      ?.imageUrl ?? ""
                  }
                  alt={
                    userList.find((user) => user.id === row.original.ownerId)
                      ?.name + "'s image" ?? "Unknown user"
                  }
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full bg-slate-300"
                />
                {
                  userList.find((user) => user.id === row.original.ownerId)
                    ?.name
                }
              </>
            ) : (
              <>
                <div className="h-6 w-6 rounded-full bg-slate-300" />
                Unknown
              </>
            )}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) =>
          row.original.updatedAt ? (
            <div className="text-xs text-muted-foreground">
              {new Date(row.original.updatedAt).toLocaleDateString()}
            </div>
          ) : (
            <></>
          ),
      },
      {
        accessorKey: "isPublic",
        header: () => <div className="flex justify-center">Public</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.isPublic ? (
              <Eye className="h-4 w-4 text-blue-500" />
            ) : (
              <EyeSlash className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <RowActions
            conlangId={row.original.id}
            conlangName={row.original.name}
          />
        ),
      },
      {
        id: "open",
        cell: ({ row }) => {
          const conlangName = row.original.name;
          return (
            <Link href={`/lang/${row.original.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground group-hover:text-accent-foreground"
              >
                <span className="sr-only">Open menu for {conlangName}</span>
                <ArrowRightCircle className="h-7 w-7" />
              </Button>
            </Link>
          );
        },
      },
    ],
    [isLoading, userList],
  );

  const handleRowClick = (row: RowType<Conlang>) => {
    router.push(`/lang/${row.original.id}`);
  };

  return (
    <div className={cn("mx-auto my-2 w-full rounded-lg", props.className)}>
      <DataTable
        columns={columns}
        data={props.conlangs}
        visibility={props.visibility}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

"use client";

import {
  type ColumnDef,
  type Row as RowType,
  type VisibilityState,
} from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { ArrowRightCircle } from "~/components/icons/arrow-right-circle";
import { DocumentText } from "~/components/icons/document-text";
import { EllipsisHorizontal } from "~/components/icons/ellipsis-horizontal";
import { Eye } from "~/components/icons/eye";
import { EyeSlash } from "~/components/icons/eye-slash";
import { Pencil } from "~/components/icons/pencil";
import { Trash } from "~/components/icons/trash";
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
import type { Conlang } from "~/types/conlang";

export const dynamic = "force-dynamic";

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
          <div className="text-xs text-muted-foreground">
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
        cell: ({ row }) => {
          const conlangId = row.original.id;
          const conlangName = row.original.name;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu for {conlangName}</span>
                  <EllipsisHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{conlangName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => alert("Conlang page not implemented")}
                >
                  <DocumentText className="mr-2 h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    router.push(`/lang/edit/${conlangId}`);
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => alert("Delete not implemented")}
                  className="text-red-700 focus:bg-red-800/10 focus:text-red-700"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "open",
        cell: ({ row }) => {
          const conlangName = row.original.name;
          return (
            <Link href={`/lang/${conlangName}`}>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full p-0 text-slate-400 transition-colors ease-in hover:bg-slate-500/10 hover:text-slate-700 group-hover:text-slate-700"
              >
                <span className="sr-only">Open menu for {conlangName}</span>
                <ArrowRightCircle className="h-7 w-7" />
              </Button>
            </Link>
          );
        },
      },
    ],
    [isLoading, router, userList],
  );

  const handleRowClick = (row: RowType<Conlang>) => {
    router.push(`/lang/${row.original.name}`);
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

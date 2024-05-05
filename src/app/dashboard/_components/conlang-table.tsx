"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useMemo } from "react";

import { CheckCircle } from "~/components/icons/check-circle";
import { DocumentText } from "~/components/icons/document-text";
import { EllipsisHorizontal } from "~/components/icons/ellipsis-horizontal";
import { Pencil } from "~/components/icons/pencil";
import { Trash } from "~/components/icons/trash";
import { XCircle } from "~/components/icons/x-circle";
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
import { useUsers } from "~/hooks/useUsers";
import type { Conlang } from "~/types/conlang";

export function ConlangTable(props: { conlangs: Conlang[] }) {
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
        accessorKey: "isPublic",
        header: "Public",
        cell: ({ row }) => (
          <div className="ml-2 flex">
            {row.original.isPublic ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-800" />
            )}
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
                Loading...
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
                <DropdownMenuItem onClick={() => alert("Edit not implemented")}>
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
    ],
    [isLoading, userList],
  );

  return (
    <div className="mx-auto my-2 w-full">
      <DataTable columns={columns} data={props.conlangs} />
    </div>
  );
}

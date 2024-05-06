"use client";

import { type VisibilityState, type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

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
import { useUsers } from "~/hooks/useUsers";
import type { Conlang } from "~/types/conlang";

export const dynamic = "force-dynamic";

export function ConlangTable(props: {
  conlangs: Conlang[];
  visibility?: VisibilityState;
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
                  onClick={() => router.push(`/conlang/edit/${conlangId}`)}
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
    ],
    [isLoading, router, userList],
  );

  return (
    <div className="mx-auto my-2 w-full">
      <DataTable
        columns={columns}
        data={props.conlangs}
        visibility={props.visibility}
      />
    </div>
  );
}

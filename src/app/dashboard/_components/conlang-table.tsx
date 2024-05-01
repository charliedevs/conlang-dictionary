"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useMemo } from "react";

import { CheckCircle } from "~/components/icons/check-circle";
import { XCircle } from "~/components/icons/x-circle";
import { DataTable } from "~/components/ui/data-table";
import { useUsers } from "~/hooks/useUsers";

type Conlang = {
  id: number;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export function ConlangTable(props: { conlangs: Conlang[] }) {
  const { data: userList, isLoading } = useUsers({
    userId: props.conlangs.map((conlang) => conlang.ownerId),
  });

  const columns: ColumnDef<Conlang>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "isPublic",
        header: "Public",
        cell: ({ row }) => (
          <div className="flex justify-center">
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
          <div className="flex items-center gap-2">
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
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    [isLoading, userList],
  );

  return (
    <div className="mx-6 my-2">
      <DataTable columns={columns} data={props.conlangs} />
    </div>
  );
}

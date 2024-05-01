"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

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
  const { data: userList } = useUsers({
    userId: props.conlangs.map((conlang) => conlang.ownerId),
  });

  console.log("userList", userList);

  const columns: ColumnDef<Conlang>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "ownerId",
        header: "Owner",
        cell: ({ row }) =>
          userList && userList.length > 0
            ? userList.find((user) => user.id === row.original.ownerId)?.name
            : "Unknown",
      },
      {
        accessorKey: "isPublic",
        header: "Public",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
      },
    ],
    [userList],
  );

  return (
    <div className="mx-6 my-2">
      <DataTable columns={columns} data={props.conlangs} />
    </div>
  );
}

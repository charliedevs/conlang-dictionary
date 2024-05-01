import { useQuery } from "@tanstack/react-query";
import { type z } from "zod";

import { type User, type getUsersSchema } from "~/app/api/users/route";

export function getUsers(params: z.infer<typeof getUsersSchema>) {
  return fetch(`/api/users?${params.userId?.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json()) as Promise<User[]>;
}

export function useUsers(params: z.infer<typeof getUsersSchema>) {
  const userList = useQuery<User[]>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });

  return userList;
}

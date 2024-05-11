import { useQuery } from "@tanstack/react-query";
import { type z } from "zod";

import { type User, type getUsersSchema } from "~/app/api/users/types";

export function getUsers(params: z.infer<typeof getUsersSchema>) {
  const queryString = new URLSearchParams();
  if (params.userId) {
    params.userId.forEach((id) => queryString.append("userId", id));
  }
  if (params.username) {
    params.username.forEach((name) => queryString.append("username", name));
  }
  if (params.emailAddress) {
    params.emailAddress.forEach((email) =>
      queryString.append("emailAddress", email),
    );
  }

  return fetch(`/api/users?${queryString.toString()}`, {
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

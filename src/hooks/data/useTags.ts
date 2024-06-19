import { useQuery } from "@tanstack/react-query";
import { type Tag } from "~/types/tag";

function getUserTags() {
  return fetch("/api/tags?tagType=word&isForUser=true", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json()) as Promise<Tag[]>;
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["userTags"],
    queryFn: () => getUserTags(),
  });
}

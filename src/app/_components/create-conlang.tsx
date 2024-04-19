"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";

import { Button } from "../_components/ui/button";
import { Skeleton } from "./ui/skeleton";

export const CreateConlang = () => {
  const { isLoaded, user } = useUser();

  const createConlang = api.conlang.create.useMutation({
    onSuccess: () => {
      console.log("Successfully created conlang");
    },
  });

  if (!isLoaded) {
    return <Skeleton className="h-10 w-10 rounded-sm" />;
  }
  if (!user) {
    console.error("User could not be found");
    return;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createConlang.mutate({
          name: "Testlang",
          description: "A test conlang",
          ownerId: user.id,
        });
      }}
    >
      <Button type="submit" disabled={createConlang.isPending}>
        {createConlang.isPending ? "Creating..." : "New Conlang"}
      </Button>
    </form>
  );
};

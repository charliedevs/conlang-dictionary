import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getUsers } from "~/hooks/useUsers";
import { getMyConlangs } from "~/server/queries";
import { ConlangTable } from "./_components/conlang-table";
import { NewConlangForm } from "./_components/new-conlang-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Get user's conlangs
  const conlangs = await getMyConlangs();

  // Prefetch user info for client
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [
      "users",
      {
        userId: conlangs.map((conlang) => conlang.ownerId),
      },
    ],
    queryFn: () =>
      getUsers({
        userId: conlangs.map((conlang) => conlang.ownerId),
      }),
  });

  return (
    <div className="mx-2 flex flex-col items-center gap-8 pt-6 md:container">
      <h1 className="w-full text-start text-3xl font-medium">Dashboard</h1>
      {conlangs.length === 0 ? (
        <NewConlangForm />
      ) : (
        <div
          id="user-conlangs"
          className="flex w-full flex-col justify-center gap-3"
        >
          <div className="flex h-full items-end justify-between">
            <div className="mx-1 flex flex-col gap-1">
              <h2 className="text-xl font-medium">My conlangs</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your languages here.
              </p>
            </div>
            <Link href="/lang/new">
              <Button variant="outline">Create a new conlang</Button>
            </Link>
          </div>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ConlangTable
              conlangs={conlangs}
              visibility={{ ownerId: false }}
              className="bg-card/80"
            />
          </HydrationBoundary>
        </div>
      )}
    </div>
  );
}

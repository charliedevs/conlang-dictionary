import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getUsers } from "~/hooks/data/useUsers";
import { getMyConlangs } from "~/server/queries";
import { ConlangTable } from "./_components/conlang-table";
import { EmptyDashboardState } from "./_components/empty-dashboard-state";
import { ImportConlangDialog } from "./_components/import-conlang-dialog";
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
        <div className="flex w-full flex-col items-center gap-4">
          <EmptyDashboardState />
          <NewConlangForm title={null} isFirstConlang />
        </div>
      ) : (
        <div
          id="user-conlangs"
          className="flex w-full flex-col justify-center gap-3"
        >
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="mx-1 flex flex-col gap-1">
              <h2 className="text-xl font-medium">My conlangs</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your {conlangs.length}{" "}
                {conlangs.length === 1 ? "language" : "languages"} here.
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <ImportConlangDialog />
              <Link href="/lang/new" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto">
                  Create a new conlang
                </Button>
              </Link>
            </div>
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

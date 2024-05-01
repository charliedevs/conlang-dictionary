import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { getUsers } from "~/hooks/useUsers";
import { getMyConlangs } from "~/server/queries";
import { ConlangForm } from "./_components/conlang-form";
import { ConlangTable } from "./_components/conlang-table";

export default async function DashboardPage() {
  // Get user's conlangs
  const conlangs = await getMyConlangs();

  // Pretech user info for client
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
    <div className="mt-8 flex flex-col items-center justify-center md:mt-24">
      <ConlangForm />
      {/* user's current conlangs */}
      <div
        id="user-conlangs"
        className="mt-10 flex flex-col justify-center gap-3"
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ConlangTable conlangs={conlangs} />
        </HydrationBoundary>
      </div>
    </div>
  );
}

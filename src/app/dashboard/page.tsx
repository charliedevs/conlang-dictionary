import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { CreateConlang } from "../_components/create-conlang";
import { api } from "~/trpc/server";

const DashboardPage = () => {
  if (!auth()) {
    return redirect("/sign-in");
  }
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-4">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Conlang Dictionary
        </h1>
        <div>
          <CreateConlang />
        </div>
        <RecentConlangs />
      </div>
    </main>
  );
};

const RecentConlangs = async () => {
  const recentLangs = await api.conlang.getRecent();

  return (
    <div>
      {recentLangs ? (
        recentLangs.map((l) => (
          <p key={l.conlang.id}>
            <span className="font-bold">{l.conlang.name}</span> by{" "}
            {l.owner.username}
          </p>
        ))
      ) : (
        <p>No conlangs found.</p>
      )}
    </div>
  );
};

export default DashboardPage;

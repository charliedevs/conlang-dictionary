import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { Dashboard } from "~/components/icons/dashboard";
import { getRecentConlangs } from "~/server/queries";
import { ConlangTable } from "./dashboard/_components/conlang-table";

async function RecentConlangs() {
  const recentConlangs = await getRecentConlangs();
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-2 text-center text-2xl font-medium text-muted-foreground ">
        Recently-updated languages:
      </div>
      <ConlangTable
        conlangs={recentConlangs}
        visibility={{ isPublic: false, createdAt: false, updatedAt: false }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-[4rem]">
        Store and share your <span className="text-dictionary">conlangs</span>
      </h1>
      <div className="mt-10 md:mt-20">
        <RecentConlangs />
      </div>
      <div className="text-center text-lg font-medium text-muted-foreground">
        <SignedOut>
          <p>
            <Link
              href="/sign-in"
              className="text-dictionary hover:underline hover:opacity-85"
            >
              Sign in
            </Link>{" "}
            to create your own conlangs.
          </p>
        </SignedOut>
        <SignedIn>
          <p className="flex">
            Visit the
            <Link
              href="/dashboard"
              className="text-dictionary mr-1 flex hover:underline hover:opacity-85"
            >
              <Dashboard className="mx-1 mt-0.5 h-6 w-6" />
              dashboard
            </Link>{" "}
            to manage your conlangs.
          </p>
        </SignedIn>
      </div>
    </div>
  );
}

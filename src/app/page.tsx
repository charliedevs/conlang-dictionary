import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { ConlangTable } from "./dashboard/_components/conlang-table";
import { Dashboard } from "~/components/icons/dashboard";

export default async function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-[4rem]">
        Store and share your <span className="text-dictionary">conlangs</span>
      </h1>
      <div className="pt-5">
        <div className="text-md p-2 text-center">
          Recently-updated languages:
        </div>
        <ConlangTable conlangs={[]} />
      </div>
      <div className="text-center">
        <SignedOut>
          <p className="text-lg">
            You can also create your own conlangs by signing in above.
          </p>
        </SignedOut>
        <SignedIn>
          <p className="flex text-lg">
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

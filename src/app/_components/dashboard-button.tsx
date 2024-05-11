import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";

import { Dashboard } from "~/components/icons/dashboard";

export function DashboardButton() {
  return (
    <SignedIn>
      <Link
        href="/dashboard"
        title="Open dashboard"
        className="rounded-full p-1 transition-all ease-in hover:bg-slate-600/15 dark:hover:text-white"
      >
        <Dashboard />
      </Link>
    </SignedIn>
  );
}

import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";

import { Dashboard } from "~/components/icons/dashboard";

export function DashboardButton() {
  return (
    <SignedIn>
      <Link
        href="/dashboard"
        title="Open dashboard"
        className="flex items-center gap-2 rounded-full p-1 transition-all ease-in hover:bg-slate-600/10 dark:hover:text-white md:rounded-lg md:p-1"
      >
        <span className="sr-only text-sm font-medium md:not-sr-only">
          Dashboard
        </span>
        <Dashboard />
      </Link>
    </SignedIn>
  );
}

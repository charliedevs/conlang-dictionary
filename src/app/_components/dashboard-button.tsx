import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";

import { Dashboard } from "~/components/icons/dashboard";
import { Button } from "~/components/ui/button";

export function DashboardButton() {
  return (
    <SignedIn>
      <Button
        variant="outline"
        className="h-9 w-9 gap-2 p-0 md:h-10 md:w-auto md:px-4 md:py-2"
        asChild
      >
        <Link href="/dashboard" title="Open dashboard">
          <Dashboard className="h-4 w-4 shrink-0" />
          <span className="sr-only text-sm font-medium md:not-sr-only">
            Dashboard
          </span>
        </Link>
      </Button>
    </SignedIn>
  );
}

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { DarkModeToggle } from "./dark-mode-toggle";
import { DashboardButton } from "./dashboard-button";
import { SearchForm } from "./search-form";

export function TopNav() {
  return (
    <nav
      className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-background p-2 md:p-4"
      aria-label="Global navigation"
    >
      <div
        id="header-left"
        className="flex items-center justify-between gap-2 md:w-auto md:gap-4"
      >
        <Link href="/" title="Go to homepage">
          <Image
            src="/images/conlang_dictionary_upscale.png"
            alt="Conlang Flag Logo"
            width={96}
            height={96}
            className="size-9 rounded-full opacity-100 outline outline-1 hover:opacity-95 dark:outline-slate-200 md:size-12"
          />
        </Link>
        <Link
          href="/"
          className="text-sm font-bold hover:text-slate-700 dark:hover:text-slate-200 sm:text-xl"
        >
          Conlang Dictionary
        </Link>
      </div>
      <div id="header-right" className="flex items-center gap-4">
        <div className="flex flex-grow flex-row items-center justify-end gap-4">
          <div className="hidden md:block">
            <SearchForm className="w-full max-w-sm" />
          </div>
          <div className="md:hidden">
            <SearchForm variant="button" />
          </div>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <DashboardButton />
            <UserButton />
          </SignedIn>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { UploadButton } from "~/app/_components/upload-button";
import { GalleryButton } from "./gallery-button";
import { Button } from "~/components/ui/button";

export function TopNav() {
  return (
    <nav
      className="flex w-full items-center justify-between border-b p-4"
      aria-label="Global navigation"
    >
      <div
        id="header-left"
        className="flex items-center justify-between gap-4 md:w-auto"
      >
        <Link href="/" className="flex" title="Go to homepage">
          <Image
            src="/images/conlang_dictionary.png"
            alt="Conlang Flag Logo"
            width={50}
            height={50}
            className="rounded-full opacity-100 outline outline-1 outline-offset-1 hover:opacity-95 dark:outline-slate-200"
          />
        </Link>
        <Link href="/" className="hidden text-xl font-bold md:block">
          Conlang Dictionary
        </Link>
      </div>
      <div id="header-right" className="flex items-center gap-4">
        <div className="flex flex-grow flex-row items-center justify-end gap-4">
          <GalleryButton />
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UploadButton />
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

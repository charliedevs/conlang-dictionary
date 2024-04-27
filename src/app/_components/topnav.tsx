"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UploadButton } from "~/utils/uploadthing";

export function TopNav() {
  const router = useRouter();

  return (
    <nav className="flex w-full items-center justify-between border-b p-4">
      <a href="/" className="text-xl font-bold">
        Conlang Dictionary
      </a>
      <div className="flex items-center gap-4">
        <a href="/">Gallery</a>
        <div className="flex flex-row items-center gap-2">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={() => {
                router.refresh();
              }}
              onUploadError={(error) => {
                alert(error.message);
              }}
            />
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

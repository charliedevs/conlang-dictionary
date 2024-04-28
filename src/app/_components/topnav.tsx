import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/app/_components/upload-button";

export function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4">
      <a href="/" className="text-xl font-bold hover:text-white">
        Conlang Dictionary
      </a>
      <div className="flex items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          <SignedOut>
            <SignInButton />
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

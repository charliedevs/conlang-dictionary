import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4">
      <a href="/" className="text-xl font-bold">
        Conlang Dictionary
      </a>
      <div className="flex items-center gap-4">
        <a href="/">Gallery</a>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <div className="mt-2">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { SignInButton, UserButton, useSession } from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

export const CurrentUser = () => {
  const { isLoaded, isSignedIn } = useSession();

  if (!isLoaded) {
    return <Skeleton className="h-[32px] w-[32px] rounded-full" />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton>
        <Button variant="outline">Sign in</Button>
      </SignInButton>
    );
  }

  return <UserButton />;
};

"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export const CurrentUser = () => {
  const { isLoaded, isSignedIn } = useUser(); // TODO: Don't show all user data to client

  // loading, show spinner. Not signed in, show sign in button. Signed in, show avatar

  if (!isSignedIn) {
    return <SignInButton />;
  }

  return <UserButton />;
};

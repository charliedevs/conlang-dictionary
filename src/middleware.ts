import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Public routes that don't require authentication
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up")
  ) {
    return NextResponse.next();
  }

  // Routes that can be accessed by authenticated users who haven't completed onboarding
  if (req.nextUrl.pathname.startsWith("/onboarding")) {
    auth().protect();
    return NextResponse.next();
  }

  // Protect all other routes
  auth().protect();
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

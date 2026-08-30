import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { resolveUser } from "~/lib/auth/resolve-user";
import { db } from "../db";
import { users } from "../db/schema";

export type CurrentUser = typeof users.$inferSelect;

function claim(claims: unknown, key: string): string | undefined {
  if (typeof claims !== "object" || claims === null) return undefined;
  const value = (claims as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

// Prefer session claims so the common path costs no Clerk API call. The fetch
// fallback matters during the cutover, when tokens minted by the old instance
// are still in flight.
async function identityFor(userId: string, sessionClaims: unknown) {
  const email = claim(sessionClaims, "email");
  const verified = claim(sessionClaims, "email_verified");
  if (email !== undefined) {
    return { clerkUserId: userId, email, emailVerified: verified === "true" };
  }

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const primary =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    ) ?? clerkUser.emailAddresses[0];
  return {
    clerkUserId: userId,
    email: primary?.emailAddress ?? null,
    emailVerified: primary?.verification?.status === "verified",
    displayName: clerkUser.fullName,
    username: clerkUser.username,
    imageUrl: clerkUser.imageUrl,
  };
}

/** Null when signed out. Creates or reclaims the local row on first sight. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: (u, { eq: equals }) => equals(u.clerkUserId, userId),
  });
  if (existing) return existing;

  const identity = await identityFor(userId, sessionClaims);

  const byEmail = identity.email
    ? await db.query.users.findMany({
        where: (u, { sql: raw }) =>
          raw`lower(${u.email}) = lower(${identity.email})`,
      })
    : [];

  const decision = resolveUser({
    identity: {
      clerkUserId: identity.clerkUserId,
      email: identity.email,
      emailVerified: identity.emailVerified,
    },
    byClerkId: null,
    byEmail,
  });

  if (decision.kind === "conflict") {
    console.error("getCurrentUser: refusing to link account", {
      clerkUserId: userId,
      reason: decision.reason,
      candidateIds: decision.candidateIds,
    });
    return null;
  }

  if (decision.kind === "reclaim") {
    console.info("getCurrentUser: reclaimed account", {
      userId: decision.user.id,
      previousClerkUserId: decision.previousClerkUserId,
      newClerkUserId: userId,
    });
    const [updated] = await db
      .update(users)
      .set({ clerkUserId: userId, updatedAt: new Date() })
      .where(eq(users.id, decision.user.id))
      .returning();
    return updated ?? null;
  }

  if (identity.email === null) {
    // users.email is NOT NULL by design; fail loudly rather than surfacing a
    // raw constraint violation.
    console.error(
      "getCurrentUser: cannot create a user with no email address",
      {
        clerkUserId: userId,
      },
    );
    return null;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: userId,
      email: identity.email,
      emailVerified: identity.emailVerified,
      username: "username" in identity ? identity.username ?? null : null,
      displayName:
        "displayName" in identity ? identity.displayName ?? null : null,
      imageUrl: "imageUrl" in identity ? identity.imageUrl ?? null : null,
    })
    .returning();
  return created ?? null;
}

/** Throws when signed out, for the many call sites that require a user. */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

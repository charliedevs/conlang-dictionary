import "server-only";

import { eq, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import type { CurrentUser } from "./current-user";

// Matches the local id, or the legacy clerk id for rows written before
// ownerUserId was backfilled. Drop the fallback with the legacy columns.
export function ownedByUser(
  ownerUserIdCol: PgColumn,
  legacyOwnerIdCol: PgColumn,
  user: CurrentUser,
): SQL {
  const byLocalId = eq(ownerUserIdCol, user.id);
  if (!user.clerkUserId) return byLocalId;
  return or(byLocalId, eq(legacyOwnerIdCol, user.clerkUserId))!;
}

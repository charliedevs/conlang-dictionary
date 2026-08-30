export interface OwnedRow {
  ownerId: string | null;
  ownerUserId: string | null;
}

export interface OwnerIdentity {
  id: string;
  clerkUserId: string | null;
}

// The clerk id fallback covers rows written by the old code before ownerUserId
// was backfilled. It can be dropped once the legacy columns are removed.
export function isOwner(row: OwnedRow, user: OwnerIdentity | null): boolean {
  if (!user) return false;
  if (row.ownerUserId !== null && row.ownerUserId === user.id) return true;
  if (
    row.ownerId !== null &&
    row.ownerId !== "" &&
    row.ownerId === user.clerkUserId
  )
    return true;
  return false;
}

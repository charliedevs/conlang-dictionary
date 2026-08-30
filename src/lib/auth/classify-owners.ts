/**
 * Decides whether every conlang owner can survive the Clerk production cutover.
 *
 * The distinction that matters: an owner whose Clerk account was *deleted* is
 * already unreachable today, so the migration does not worsen their position and
 * they must not be counted as a blocker. An owner who is still live in Clerk but
 * absent from our snapshot is a genuine blocker — we would lose someone who can
 * still sign in.
 *
 * Where we cannot tell those apart (no Clerk lookup was performed), the owner is
 * `unclassified` and counts as blocking. Guessing "deleted" would hide real data
 * loss behind a green result.
 */

export interface OwnerRow {
  ownerId: string;
  conlangCount: number;
}

export interface SnapshotIdentity {
  email: string | null;
  emailVerified: boolean;
}

export interface OwnerClassification {
  /** Verified email in the snapshot — reclaims automatically. */
  reclaimable: OwnerRow[];
  /** Email present but unverified — will not auto-reclaim. Warning, not blocker. */
  unverified: OwnerRow[];
  /** In the snapshot but with no email — cannot be matched. Blocking. */
  noEmail: OwnerRow[];
  /** Absent from the snapshot and confirmed gone from Clerk. Pre-existing orphan. */
  deletedFromClerk: OwnerRow[];
  /** Absent from the snapshot but still live in Clerk. Blocking. */
  missingButLive: OwnerRow[];
  /** Absent from the snapshot, Clerk not consulted. Blocking by default. */
  unclassified: OwnerRow[];
  blockingCount: number;
  preExistingOrphanCount: number;
  conlangsBlocked: number;
  conlangsPreExistingOrphaned: number;
  pass: boolean;
}

export function classifyOwners(input: {
  owners: OwnerRow[];
  snapshot: Map<string, SnapshotIdentity>;
  /** ownerId → whether the account still exists in Clerk. Absent entries stay unclassified. */
  existsInClerk?: Map<string, boolean>;
}): OwnerClassification {
  const { owners, snapshot, existsInClerk } = input;

  const reclaimable: OwnerRow[] = [];
  const unverified: OwnerRow[] = [];
  const noEmail: OwnerRow[] = [];
  const deletedFromClerk: OwnerRow[] = [];
  const missingButLive: OwnerRow[] = [];
  const unclassified: OwnerRow[] = [];

  for (const row of owners) {
    const identity = snapshot.get(row.ownerId);

    if (identity === undefined) {
      const exists = existsInClerk?.get(row.ownerId);
      if (exists === true) missingButLive.push(row);
      else if (exists === false) deletedFromClerk.push(row);
      else unclassified.push(row);
      continue;
    }

    if (identity.email === null) noEmail.push(row);
    else if (!identity.emailVerified) unverified.push(row);
    else reclaimable.push(row);
  }

  const blocking = [...noEmail, ...missingButLive, ...unclassified];
  const sumConlangs = (rows: OwnerRow[]) =>
    rows.reduce((total, row) => total + row.conlangCount, 0);

  return {
    reclaimable,
    unverified,
    noEmail,
    deletedFromClerk,
    missingButLive,
    unclassified,
    blockingCount: blocking.length,
    preExistingOrphanCount: deletedFromClerk.length,
    conlangsBlocked: sumConlangs(blocking),
    conlangsPreExistingOrphaned: sumConlangs(deletedFromClerk),
    pass: blocking.length === 0,
  };
}

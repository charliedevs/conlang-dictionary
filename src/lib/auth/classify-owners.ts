// Classifies conlang owners for cutover readiness. An account deleted from Clerk
// is already unreachable today, so it is reported separately from a live owner
// we would actually lose. Anything inconclusive counts as blocking.

export interface OwnerRow {
  ownerId: string;
  conlangCount: number;
}

export interface SnapshotIdentity {
  email: string | null;
  emailVerified: boolean;
}

export interface OwnerClassification {
  reclaimable: OwnerRow[];
  unverified: OwnerRow[];
  noEmail: OwnerRow[];
  deletedFromClerk: OwnerRow[];
  missingButLive: OwnerRow[];
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

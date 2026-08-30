/**
 * READ-ONLY audit of conlang ownership against a Clerk identity snapshot.
 *
 * Answers the question the migration depends on: can every conlang owner who
 * can still sign in today be reclaimed after the production cutover?
 *
 * Issues SELECT statements only. Contains no INSERT/UPDATE/DELETE/DDL.
 *
 *   node --env-file=.env.local scripts/audit-users.ts --prefix=test_conlang-dictionary_
 *   node --env-file=.env.local scripts/audit-users.ts --prefix=conlang-dictionary_ --check-clerk
 *
 * The prefix is passed explicitly rather than read from TABLE_PREFIX so that
 * touching production tables is always a deliberate, visible act.
 *
 * The classification itself lives in src/lib/auth/classify-owners.ts and is
 * unit tested; this file is only I/O and rendering.
 */

import { readFileSync, readdirSync } from "node:fs";
import postgres from "postgres";

import {
  classifyOwners,
  type OwnerRow,
  type SnapshotIdentity,
} from "../src/lib/auth/classify-owners.ts";
import type { ExportedUser } from "../src/lib/clerk-export/extract-user.ts";

function requireArg(name: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!hit) throw new Error(`Missing required argument --${name}=...`);
  return hit.slice(name.length + 3);
}

interface Snapshot {
  exportedAt: string;
  instanceKind: string;
  users: ExportedUser[];
}

function readSnapshot(path: string): { file: string; snapshot: Snapshot } {
  return {
    file: path,
    snapshot: JSON.parse(readFileSync(path, "utf8")) as Snapshot,
  };
}

/**
 * Selects the most recently exported snapshot.
 *
 * Deliberately ordered by the recorded `exportedAt`, never by filename: names
 * are `clerk-users-{kind}-{timestamp}.json`, so the *kind* sorts ahead of the
 * timestamp and a lexicographic sort would prefer an old `production` export
 * over a newer `development` one the moment both exist. Pass --snapshot=<path>
 * to override.
 */
function latestSnapshot(): { file: string; snapshot: Snapshot } {
  const explicit = process.argv.find((a) => a.startsWith("--snapshot="));
  if (explicit) return readSnapshot(explicit.slice("--snapshot=".length));

  const candidates = readdirSync("backups")
    .filter((f) => f.startsWith("clerk-users-") && f.endsWith(".json"))
    .map((f) => readSnapshot(`backups/${f}`))
    .sort((a, b) => a.snapshot.exportedAt.localeCompare(b.snapshot.exportedAt));

  const latest = candidates.at(-1);
  if (!latest)
    throw new Error(
      "No snapshot in ./backups — run export-clerk-users.ts first",
    );
  return latest;
}

/** Resolves whether each id still exists in Clerk. A failed lookup is left absent. */
async function checkClerk(ids: string[]): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>();
  for (const id of ids) {
    try {
      const res = await fetch(`https://api.clerk.com/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      });
      if (res.status === 404) result.set(id, false);
      else if (res.ok) result.set(id, true);
      // Any other status is inconclusive: leave it out so it stays `unclassified`
      // and therefore blocking, rather than assuming it is safely deleted.
    } catch {
      /* network failure is inconclusive — leave absent */
    }
  }
  return result;
}

function list(label: string, rows: OwnerRow[]): void {
  if (rows.length === 0) return;
  console.log(`  ${label}:`);
  for (const r of rows)
    console.log(`    ${r.ownerId} owns ${r.conlangCount} conlang(s)`);
}

async function main(): Promise<void> {
  const prefix = requireArg("prefix");
  const withClerk = process.argv.includes("--check-clerk");

  console.log(`Table prefix : ${prefix}`);
  console.log(
    `Target       : ${prefix.startsWith("test_") ? "test (throwaway)" : "*** PRODUCTION ***"}`,
  );

  const { file, snapshot: snapshotFile } = latestSnapshot();
  const users = snapshotFile.users;
  console.log(
    `Snapshot     : ${file}\n               ${users.length} users, ${snapshotFile.instanceKind} instance, exported ${snapshotFile.exportedAt}\n`,
  );

  const snapshot = new Map<string, SnapshotIdentity>(
    users.map((u) => [
      u.clerkUserId,
      { email: u.email, emailVerified: u.emailVerified },
    ]),
  );
  const nameById = new Map(
    users.map((u) => [u.clerkUserId, u.displayName ?? u.username]),
  );

  const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
  try {
    const rows = await sql<{ ownerId: string; n: string }[]>`
      select "ownerId", count(*)::text as n
      from ${sql(prefix + "conlang")}
      group by "ownerId"
      order by count(*) desc
    `;
    const owners: OwnerRow[] = rows.map((r) => ({
      ownerId: r.ownerId,
      conlangCount: Number(r.n),
    }));
    const totalConlangs = owners.reduce((a, o) => a + o.conlangCount, 0);

    const missing = owners
      .filter((o) => !snapshot.has(o.ownerId))
      .map((o) => o.ownerId);
    const existsInClerk = withClerk ? await checkClerk(missing) : undefined;

    const c = classifyOwners({ owners, snapshot, existsInClerk });

    console.log(
      `conlangs: ${totalConlangs} across ${owners.length} distinct owners`,
    );
    console.log(
      `snapshot users who own no conlang: ${users.length - c.reclaimable.length - c.unverified.length - c.noEmail.length}\n`,
    );

    console.log("=== Owners absent from the snapshot ===");
    if (missing.length === 0)
      console.log("  none — every conlang owner is in the snapshot");
    else if (!withClerk)
      console.log(
        `  ${missing.length} unclassified (pass --check-clerk to tell deleted from live)`,
      );
    else {
      console.log(
        `  ${c.deletedFromClerk.length} deleted from Clerk — PRE-EXISTING orphans, not a migration risk`,
      );
      list("deleted", c.deletedFromClerk);
      list(
        "STILL LIVE in Clerk but missing from snapshot — BLOCKING",
        c.missingButLive,
      );
    }
    list("inconclusive Clerk lookup — treated as BLOCKING", c.unclassified);

    console.log(
      "\n=== BLOCKING: owners with no email (cannot auto-reclaim) ===",
    );
    if (c.noEmail.length === 0) console.log("  none");
    else
      for (const r of c.noEmail)
        console.log(
          `  ${r.ownerId} (${nameById.get(r.ownerId) ?? "no name"}) owns ${r.conlangCount} conlang(s)`,
        );

    console.log(
      "\n=== WARN: owners with an unverified email (will not auto-reclaim) ===",
    );
    console.log(
      c.unverified.length === 0
        ? "  none"
        : `  ${c.unverified.length} owner(s)`,
    );

    console.log("");
    for (const [table, column] of [
      [prefix + "lexicalCategories", "ownerId"],
      [prefix + "tag", "createdBy"],
      [prefix + "feedback", "userId"],
    ] as const) {
      try {
        const ids = await sql<{ id: string }[]>`
          select distinct ${sql(column)} as id from ${sql(table)} where ${sql(column)} is not null
        `;
        const orphans = ids.filter((r) => !snapshot.has(r.id));
        console.log(
          `${table}.${column}: ${ids.length} distinct ids, ${orphans.length} not in snapshot (tolerable)`,
        );
      } catch {
        console.log(`${table}.${column}: table not present, skipped`);
      }
    }

    console.log(
      `\nPre-existing orphans (already unreachable today): ${c.preExistingOrphanCount} owner(s), ${c.conlangsPreExistingOrphaned} conlang(s)`,
    );
    console.log(
      `Blocking for cutover: ${c.blockingCount} owner(s), ${c.conlangsBlocked} conlang(s)`,
    );
    console.log(
      c.pass
        ? "\nRESULT: PASS — every conlang with a reachable owner can be reclaimed."
        : `\nRESULT: FAIL — ${c.blockingCount} live owner(s) need manual recovery before cutover.`,
    );
    process.exitCode = c.pass ? 0 : 1;
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error("\nAudit failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

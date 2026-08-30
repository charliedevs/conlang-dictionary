/**
 * Populates `users` from a Clerk snapshot, then fills the ownership columns.
 * Idempotent: upserts by clerkUserId and only fills columns still null.
 *
 *   node --env-file=.env.local scripts/backfill-users.ts --prefix=test_conlang-dictionary_ --dry-run
 *
 * A non-test prefix also requires --allow-production.
 */

import postgres from "postgres";

import { toUserRecord } from "../src/lib/auth/backfill-record.ts";
import { planOwnershipBackfill } from "../src/lib/auth/plan-ownership-backfill.ts";
import { assertTargetAllowed, latestSnapshot, requireArg } from "./snapshot.ts";

const OWNERSHIP_COLUMNS = [
  { table: "conlang", from: "ownerId", to: "ownerUserId", blocking: true },
  {
    table: "lexicalCategories",
    from: "ownerId",
    to: "ownerUserId",
    blocking: false,
  },
  { table: "tag", from: "createdBy", to: "createdByUserId", blocking: false },
  {
    table: "feedback",
    from: "userId",
    to: "submittedByUserId",
    blocking: false,
  },
] as const;

async function main(): Promise<void> {
  const prefix = requireArg("prefix");
  const dryRun = process.argv.includes("--dry-run");
  assertTargetAllowed(prefix);

  const { file, snapshot } = latestSnapshot();

  console.log(`Table prefix : ${prefix}`);
  console.log(
    `Target       : ${prefix.startsWith("test_") ? "test (throwaway)" : "*** PRODUCTION ***"}`,
  );
  console.log(`Snapshot     : ${file}`);
  console.log(
    `               ${snapshot.users.length} users, ${snapshot.instanceKind}, exported ${snapshot.exportedAt}`,
  );
  console.log(`Mode         : ${dryRun ? "DRY RUN, no writes" : "WRITE"}\n`);

  const results = snapshot.users.map(toUserRecord);
  const accepted = results.flatMap((r) => (r.ok ? [r.record] : []));
  const rejected = results.flatMap((r) => (r.ok ? [] : [r]));

  console.log(`records accepted : ${accepted.length}`);
  console.log(`records rejected : ${rejected.length}`);
  for (const r of rejected)
    console.log(`   ${r.clerkUserId}: ${r.problems.join("; ")}`);

  const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
  try {
    const users = sql(prefix + "user");

    const before = await sql<
      { n: string }[]
    >`select count(*)::text as n from ${users}`;
    console.log(`\nexisting rows in ${prefix}user: ${before[0]!.n}`);

    if (!dryRun) {
      // clerkUserId is not updated here; rewriting it is the cutover's job.
      for (const r of accepted) {
        await sql`
          insert into ${users} ${sql({
            clerkUserId: r.clerkUserId,
            email: r.email,
            emailVerified: r.emailVerified,
            username: r.username,
            displayName: r.displayName,
            imageUrl: r.imageUrl,
          })}
          on conflict ("clerkUserId") do update set
            "email" = excluded."email",
            "emailVerified" = excluded."emailVerified",
            "username" = excluded."username",
            "displayName" = excluded."displayName",
            "imageUrl" = excluded."imageUrl",
            "updatedAt" = now()
        `;
      }
    }

    const after = await sql<
      { n: string }[]
    >`select count(*)::text as n from ${users}`;
    console.log(`rows in ${prefix}user after upsert: ${after[0]!.n}`);

    const rows = await sql<{ clerkUserId: string; id: string }[]>`
      select "clerkUserId", id from ${users} where "clerkUserId" is not null
    `;
    const userIdByClerkId = new Map(rows.map((r) => [r.clerkUserId, r.id]));

    // On a dry run the upsert has not happened, so stand in for the rows it
    // would have created. Otherwise the plan always reports every owner unmapped.
    if (dryRun) {
      for (const r of accepted) {
        if (!userIdByClerkId.has(r.clerkUserId)) {
          userIdByClerkId.set(
            r.clerkUserId,
            "00000000-0000-0000-0000-000000000000",
          );
        }
      }
    }

    console.log("\nownership columns:");
    let blockingUnmapped = 0;

    for (const col of OWNERSHIP_COLUMNS) {
      const table = sql(prefix + col.table);
      let distinct: { id: string }[];
      try {
        distinct = await sql<{ id: string }[]>`
          select distinct ${sql(col.from)} as id from ${table} where ${sql(col.from)} is not null
        `;
      } catch {
        console.log(`  ${col.table}: table not present, skipped`);
        continue;
      }

      const plan = planOwnershipBackfill({
        distinctOwnerIds: distinct.map((d) => d.id),
        userIdByClerkId,
      });

      if (!dryRun) {
        for (const m of plan.mapped) {
          await sql`
            update ${table}
            set ${sql(col.to)} = ${m.userId}::uuid
            where ${sql(col.from)} = ${m.clerkUserId} and ${sql(col.to)} is null
          `;
        }
      }

      const filled = await sql<{ n: string }[]>`
        select count(*)::text as n from ${table} where ${sql(col.to)} is not null
      `;
      const total = await sql<
        { n: string }[]
      >`select count(*)::text as n from ${table}`;

      const mark =
        plan.unmapped.length > 0
          ? col.blocking
            ? "  BLOCKING"
            : "  (tolerable)"
          : "";
      console.log(
        `  ${col.table}.${col.to}: ${filled[0]!.n}/${total[0]!.n} rows mapped, ` +
          `${plan.mapped.length} owners mapped, ${plan.unmapped.length} unmapped${mark}`,
      );
      for (const u of plan.unmapped.slice(0, 10))
        console.log(`      unmapped: ${u}`);
      if (plan.unmapped.length > 10)
        console.log(`      ...and ${plan.unmapped.length - 10} more`);

      if (col.blocking) blockingUnmapped += plan.unmapped.length;
    }

    console.log(
      blockingUnmapped === 0
        ? "\nRESULT: PASS. Every conlang owner maps to a local user."
        : `\nRESULT: FAIL. ${blockingUnmapped} conlang owner(s) have no local user.`,
    );
    process.exitCode = blockingUnmapped === 0 ? 0 : 1;
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error("\nBackfill failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

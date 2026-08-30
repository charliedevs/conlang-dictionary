/**
 * Exports every user from the Clerk instance identified by CLERK_SECRET_KEY
 * into a timestamped JSON snapshot under ./backups/.
 *
 * This exists because Clerk development instances cannot export or transfer
 * user data between instances — this snapshot is the only durable record of
 * who our users are, and it is the precondition for the production cutover
 * (see tasks/plan.md, Phase 0).
 *
 * Read-only against Clerk. Touches no database.
 *
 *   node --env-file=.env.local scripts/export-clerk-users.ts --dry-run
 *   node --env-file=.env.local scripts/export-clerk-users.ts
 *
 * Refuses to write if the fetched count disagrees with Clerk's own count;
 * --allow-partial overrides that after the difference has been understood.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Relative + explicit .ts extension: this runs under Node's type stripping,
// which does not resolve the `~/*` tsconfig alias used by app code.
import {
  extractUser,
  instanceKind,
  type ClerkApiUser,
  type ExportedUser,
} from "../src/lib/clerk-export/extract-user.ts";
import { summarizeUsers } from "../src/lib/clerk-export/summarize.ts";

interface ClerkCount {
  total_count: number;
}

const API_BASE = "https://api.clerk.com/v1";
const PAGE_SIZE = 100;
const PAGE_DELAY_MS = 250;

function requireSecretKey(): string {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "CLERK_SECRET_KEY is not set. Run with: node --env-file=.env.local scripts/export-clerk-users.ts",
    );
  }
  return key;
}

async function clerkGet<T>(path: string, secretKey: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Clerk API ${res.status} on ${path}: ${body.slice(0, 500)}`,
    );
  }
  return (await res.json()) as T;
}

async function fetchAllUsers(secretKey: string): Promise<ExportedUser[]> {
  const all: ExportedUser[] = [];
  let offset = 0;

  for (;;) {
    const page = await clerkGet<ClerkApiUser[]>(
      `/users?limit=${PAGE_SIZE}&offset=${offset}&order_by=%2Bcreated_at`,
      secretKey,
    );
    if (page.length === 0) break;

    all.push(...page.map(extractUser));
    process.stdout.write(`  fetched ${all.length} users\r`);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    await new Promise((r) => setTimeout(r, PAGE_DELAY_MS));
  }

  process.stdout.write("\n");
  return all;
}

function render(users: ExportedUser[]): void {
  const s = summarizeUsers(users);

  console.log(`\nTotal users: ${s.total}`);

  console.log("\nSign-in providers:");
  for (const { providers, count } of s.providerCounts) {
    const pct = ((count / s.total) * 100).toFixed(1);
    console.log(
      `  ${String(count).padStart(5)}  ${pct.padStart(5)}%  ${providers}`,
    );
  }

  console.log("\nReclaim readiness:");
  console.log(`  ${s.reclaimable} reclaimable (verified email)`);
  console.log(
    `  ${s.unverified} unverified email — will NOT auto-reclaim, needs manual recovery`,
  );
  console.log(`  ${s.noEmail.length} no email at all — cannot be matched`);
  console.log(
    `  ${s.duplicateEmails.length} email addresses shared by more than one account — will resolve as 'conflict'`,
  );

  console.log(
    "\nApple exposure (Apple SSO is being dropped — needs a paid developer account):",
  );
  console.log(`  ${s.appleOnly} accounts can sign in ONLY via Apple today`);
  console.log(
    `  ${s.appleOnlyRelay} of those use an @privaterelay.appleid.com address`,
  );
  console.log(
    `    → relay users must reclaim via EMAIL CODE to that relay address (Apple forwards it)`,
  );
  console.log(
    `  ${s.appleOnly - s.appleOnlyRelay} use a real address → can also reclaim via Google/GitHub if it matches`,
  );

  if (s.noEmail.length > 0) {
    console.log("\n  Accounts with no email:");
    for (const u of s.noEmail.slice(0, 20))
      console.log(`    ${u.clerkUserId} (${u.username ?? "no username"})`);
    if (s.noEmail.length > 20)
      console.log(`    ...and ${s.noEmail.length - 20} more`);
  }
  // Addresses themselves are deliberately not printed — this output lands in
  // terminal scrollback and CI logs. The account ids are enough to investigate.
  if (s.duplicateEmails.length > 0) {
    console.log("\n  Accounts sharing an email address (addresses withheld):");
    for (const d of s.duplicateEmails.slice(0, 20)) {
      const ids = users
        .filter((u) => u.email?.trim().toLowerCase() === d.email)
        .map((u) => u.clerkUserId);
      console.log(`    ${ids.join(", ")} (${d.count} accounts)`);
    }
    if (s.duplicateEmails.length > 20)
      console.log(`    ...and ${s.duplicateEmails.length - 20} more`);
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const allowPartial = process.argv.includes("--allow-partial");
  const secretKey = requireSecretKey();
  const kind = instanceKind(secretKey);

  console.log(`Clerk instance: ${kind} (key prefix ${secretKey.slice(0, 8)}…)`);
  console.log(
    dryRun ? "Mode: DRY RUN — no file will be written\n" : "Mode: export\n",
  );

  const { total_count: reported } = await clerkGet<ClerkCount>(
    "/users/count",
    secretKey,
  );
  console.log(`Clerk reports ${reported} users. Fetching…`);

  const users = await fetchAllUsers(secretKey);

  render(users);

  // A short snapshot is silently dangerous: audit-users.ts compares production
  // owners against this file, so a user missing here is reported as "deleted
  // from Clerk" — i.e. classified as a non-issue — and their conlang quietly
  // becomes unrecoverable. Refuse to write rather than let that happen.
  if (users.length !== reported) {
    const message = `fetched ${users.length} users but Clerk reported ${reported}`;
    if (!allowPartial) {
      throw new Error(
        `${message}. Refusing to write an incomplete snapshot. ` +
          `Re-run, or pass --allow-partial if you have confirmed the difference is benign.`,
      );
    }
    console.warn(`\n  WARNING: ${message} — writing anyway (--allow-partial).`);
  }

  if (dryRun) {
    console.log("\nDry run — nothing written.");
    return;
  }

  const dir = resolve(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = resolve(dir, `clerk-users-${kind}-${stamp}.json`);

  writeFileSync(
    file,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        instanceKind: kind,
        reportedCount: reported,
        users,
      },
      null,
      2,
    ),
    // Owner-only: this file contains every user's email address.
    { encoding: "utf8", mode: 0o600 },
  );

  console.log(`\nWrote ${users.length} users to ${file}`);
  console.log("Copy this file somewhere off this machine before continuing.");
}

main().catch((err: unknown) => {
  console.error("\nExport failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

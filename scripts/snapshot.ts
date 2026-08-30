// Shared snapshot loading and argument handling for the migration scripts.

import { readFileSync, readdirSync } from "node:fs";

import type { ExportedUser } from "../src/lib/clerk-export/extract-user.ts";

export interface Snapshot {
  exportedAt: string;
  instanceKind: string;
  reportedCount: number;
  users: ExportedUser[];
}

function read(path: string): { file: string; snapshot: Snapshot } {
  return {
    file: path,
    snapshot: JSON.parse(readFileSync(path, "utf8")) as Snapshot,
  };
}

// Ordered by recorded `exportedAt`, not filename: the kind sorts ahead of the
// timestamp, so a lexicographic sort would prefer an old production export.
export function latestSnapshot(argv: string[] = process.argv): {
  file: string;
  snapshot: Snapshot;
} {
  const explicit = argv.find((a) => a.startsWith("--snapshot="));
  if (explicit) return read(explicit.slice("--snapshot=".length));

  const candidates = readdirSync("backups")
    .filter((f) => f.startsWith("clerk-users-") && f.endsWith(".json"))
    .map((f) => read(`backups/${f}`))
    .sort((a, b) => a.snapshot.exportedAt.localeCompare(b.snapshot.exportedAt));

  const latest = candidates.at(-1);
  if (!latest) {
    throw new Error(
      "No snapshot in ./backups, run export-clerk-users.ts first",
    );
  }
  return latest;
}

export function requireArg(
  name: string,
  argv: string[] = process.argv,
): string {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  if (!hit) throw new Error(`Missing required argument --${name}=...`);
  return hit.slice(name.length + 3);
}

// A flag rather than an interactive prompt, so runbook commands stay reproducible.
export function assertTargetAllowed(
  prefix: string,
  argv: string[] = process.argv,
): void {
  const isProduction = !prefix.startsWith("test_");
  if (isProduction && !argv.includes("--allow-production")) {
    throw new Error(
      `Refusing to write to a non-test prefix (${prefix}) without --allow-production.`,
    );
  }
}

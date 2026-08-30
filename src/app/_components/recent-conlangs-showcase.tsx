"use client";

import Link from "next/link";

import { ArrowRightCircle } from "~/components/icons/arrow-right-circle";
import { useUsers } from "~/hooks/data/useUsers";
import { type Conlang } from "~/types/conlang";

export function RecentConlangsShowcase({
  conlangs,
}: {
  conlangs: Conlang[];
}) {
  const { data: userList } = useUsers({
    userId: conlangs.map((conlang) => conlang.ownerId),
  });

  if (conlangs.length === 0) {
    return (
      <div className="w-full rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No public conlangs yet — be the first to share yours!
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {conlangs.map((conlang) => {
        const owner = userList?.find((user) => user.id === conlang.ownerId);
        return (
          <Link
            key={conlang.id}
            href={`/lang/${conlang.id}`}
            className="group/card flex items-start gap-3 rounded-lg border bg-card/80 p-4 transition-colors hover:border-foreground/20 hover:bg-card"
          >
            <span className="text-3xl leading-none" aria-hidden>
              {conlang.emoji ?? "🌐"}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-semibold">
                {conlang.name}
              </span>
              {conlang.description && (
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {conlang.description}
                </span>
              )}
              {owner?.name && (
                <span className="text-xs text-muted-foreground/80">
                  by {owner.name}
                </span>
              )}
            </span>
            <ArrowRightCircle className="ml-auto size-5 shrink-0 self-center text-muted-foreground transition-colors group-hover/card:text-foreground" />
          </Link>
        );
      })}
    </div>
  );
}

export function RecentConlangsShowcaseSkeleton() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2" aria-hidden>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-3 rounded-lg border bg-card/80 p-4"
        >
          <div className="size-8 shrink-0 rounded-full bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

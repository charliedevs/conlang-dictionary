/**
 * Loading skeletons for the Grammar Suspense boundaries. They mirror the shape
 * of the content that replaces them (a header line plus a bordered list of
 * rows) so the layout doesn't jump when data arrives.
 */

function SkeletonBar(props: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-muted ${props.className ?? ""}`} />
  );
}

function ListPanelSkeleton(props: { rows?: number }) {
  const rows = props.rows ?? 5;
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <SkeletonBar className="h-4 w-2/5" />
          <div className="ml-auto flex items-center gap-3">
            <SkeletonBar className="h-3 w-12" />
            <SkeletonBar className="size-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GrammarSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pl-1">
        <SkeletonBar className="h-5 w-40" />
      </div>
      <ListPanelSkeleton />
    </div>
  );
}

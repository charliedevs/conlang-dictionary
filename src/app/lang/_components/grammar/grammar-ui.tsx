import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Shared presentational pieces for the Grammar surface so its views read as one
 * system: a section header with an optional back affordance, a bordered list
 * panel of navigable rows, and a teaching empty state.
 */

export function GrammarSectionHeader(props: {
  title: string;
  backHref?: string;
  backLabel?: string;
  meta?: ReactNode;
  /** Right-aligned control, e.g. an "Add" button. */
  action?: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {props.backHref && (
        <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
          <Link href={props.backHref}>
            <ChevronLeftIcon className="size-4" />
            <span className="sr-only">{props.backLabel ?? "Back"}</span>
          </Link>
        </Button>
      )}
      <h2
        className={cn(
          "truncate text-lg font-semibold tracking-tight",
          !props.backHref && "pl-1",
          props.titleClassName,
        )}
      >
        {props.title}
      </h2>
      {(props.meta ?? props.action) && (
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {props.meta && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {props.meta}
            </span>
          )}
          {props.action}
        </div>
      )}
    </div>
  );
}

/** A bordered container that hairlines its children into rows. */
export function ListPanel(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-lg border bg-card",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

/**
 * A single navigable row inside a {@link ListPanel}: a primary label with
 * optional secondary line, trailing metadata, and a chevron affordance. The
 * focus ring is inset so the panel's `overflow-hidden` can't clip it.
 */
export function RowLink(props: {
  href: string;
  label: ReactNode;
  /** Secondary line rendered beneath the label. */
  secondary?: ReactNode;
  /** Muted gloss rendered inline to the right of the label; truncates. */
  hint?: ReactNode;
  meta?: ReactNode;
  labelClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={props.href}
      aria-label={props.ariaLabel}
      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {props.hint ? (
        <span className="flex min-w-0 flex-1 items-baseline gap-3 sm:gap-5">
          <span
            title={typeof props.label === "string" ? props.label : undefined}
            className={cn(
              "min-w-[5rem] max-w-[55%] shrink-0 truncate text-sm font-semibold sm:min-w-[8rem]",
              props.labelClassName,
            )}
          >
            {props.label}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {props.hint}
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-medium",
              props.labelClassName,
            )}
          >
            {props.label}
          </span>
          {props.secondary && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {props.secondary}
            </span>
          )}
        </span>
      )}
      {props.meta && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {props.meta}
        </span>
      )}
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
    </Link>
  );
}

/** A centered, teaching empty state — never a bare "nothing here". */
export function GrammarEmptyState(props: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {props.icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{props.title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {props.description}
        </p>
      </div>
    </div>
  );
}

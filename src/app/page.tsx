import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { Suspense } from "react";
import { AdjustmentsHorizontal } from "~/components/icons/adjustments-horizontal";
import { Bolt } from "~/components/icons/bolt";
import { BookOpen } from "~/components/icons/book-open";
import { Dashboard } from "~/components/icons/dashboard";
import { DevicePhoneMobile } from "~/components/icons/device-phone-mobile";
import { ExclamationTriangle } from "~/components/icons/exclamation-triangle";
import { Globe } from "~/components/icons/globe";
import { PresentationChartLine } from "~/components/icons/presentation-chart-line";
import { Users } from "~/components/icons/users";
import { Button } from "~/components/ui/button";
import { getRecentConlangs } from "~/server/queries";
import {
  RecentConlangsShowcase,
  RecentConlangsShowcaseSkeleton,
} from "./_components/recent-conlangs-showcase";

const ROADMAP_ITEMS = [
  {
    icon: AdjustmentsHorizontal,
    title: "Set Rules",
    description: "Get warnings when a word breaks your phonotactics.",
  },
  {
    icon: Bolt,
    title: "Generate Inflections",
    description: "Declensions and conjugations, with editable exceptions.",
  },
  {
    icon: PresentationChartLine,
    title: "Analyze",
    description: "Frequency and usage insights across your lexicon.",
  },
];

async function RecentConlangs() {
  const recentConlangs = await getRecentConlangs();
  return <RecentConlangsShowcase conlangs={recentConlangs} />;
}

export default function HomePage() {
  return (
    <div className="container flex max-w-5xl flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="max-w-2xl text-center text-5xl font-extrabold tracking-tight md:text-[4rem]">
        Build and share your <span className="text-dictionary">conlangs</span>
      </h1>
      <p className="mx-auto max-w-lg text-pretty text-center text-lg font-medium tracking-wide text-muted-foreground md:max-w-4xl md:text-xl">
        Craft the phonology, lexicon, and grammar of your language. Collaborate,
        refine, and harness your conlanging creativity with a suite of versatile
        tools.
      </p>
      <div
        id="alphaWarning"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dictionary/10 p-4 text-lg text-accent-foreground"
      >
        <ExclamationTriangle className="size-6 flex-shrink-0 text-accent-foreground" />
        <p className="max-w-lg text-center md:max-w-5xl">
          This website is currently in early development. Please be patient with
          any issues or bugs you encounter.
        </p>
      </div>
      <div
        id="features"
        className="flex w-full flex-col items-center text-pretty text-left"
      >
        <h2 className="sr-only">Features</h2>
        <div className="mt-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-accent p-6">
            <BookOpen className="mb-4 size-12 rounded-lg bg-card p-2 text-foreground/70" />
            <h3 className="mb-2 text-base font-semibold">
              Grow Your Dictionary
            </h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Build your language&apos;s lexicon, grammar, and phonological
              inventory.
            </p>
          </div>
          <div className="rounded-xl bg-accent p-6">
            <Users className="mb-4 size-12 rounded-lg bg-card p-2 text-foreground/70" />
            <h3 className="mb-2 text-base font-semibold">Collaborate</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Showcase your work and collaborate with others on your constructed
              languages.
            </p>
          </div>
          <div className="rounded-xl bg-accent p-6">
            <DevicePhoneMobile className="mb-4 size-12 rounded-lg bg-card p-2 text-foreground/70" />
            <h3 className="mb-2 text-base font-semibold">Access Anywhere</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Responsive design for access from mobile devices.
            </p>
          </div>
        </div>
        <div className="mt-4 w-full rounded-xl border border-dashed p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On the roadmap
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROADMAP_ITEMS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div id="recentConlangs" className="w-full rounded-xl bg-accent p-8 dark:bg-card">
        <h2 className="flex items-center gap-2 text-start text-xl font-semibold tracking-tight">
          <Globe className="size-5 shrink-0 text-muted-foreground" />
          Share your conlangs with the world!
        </h2>
        <p className="mb-6 mt-2 max-w-2xl text-sm font-medium tracking-wide text-muted-foreground">
          Set your conlang as <em>Public</em> to allow anyone to view it, and
          share a link directly to your conlang with others. Check out some
          recently-updated languages here:
        </p>
        <Suspense fallback={<RecentConlangsShowcaseSkeleton />}>
          <RecentConlangs />
        </Suspense>
        <div className="mt-6 flex w-full justify-center">
          <Button asChild>
            <Link href="/search">View All Conlangs</Link>
          </Button>
        </div>
      </div>
      <div
        id="callToAction"
        className="w-full rounded-xl bg-primary p-8 text-primary-foreground"
      >
        <h2 className="text-2xl font-bold tracking-tight">
          Ready to create your own language?
        </h2>
        <SignedOut>
          <p className="mb-5 mt-2 text-sm font-medium text-primary-foreground/70">
            Sign up to get started building!
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <p className="mb-5 mt-2 text-sm font-medium text-primary-foreground/70">
            Visit your dashboard to manage your conlangs.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/dashboard">
              <Dashboard className="mr-2 size-4" />
              Go to dashboard
            </Link>
          </Button>
        </SignedIn>
      </div>
    </div>
  );
}

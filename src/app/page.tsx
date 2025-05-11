import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { Earth, MessageCircleWarningIcon } from "lucide-react";
import { Suspense } from "react";
import { AdjustmentsHorizontal } from "~/components/icons/adjustments-horizontal";
import { Bolt } from "~/components/icons/bolt";
import { BookOpen } from "~/components/icons/book-open";
import { Dashboard } from "~/components/icons/dashboard";
import { DevicePhoneMobile } from "~/components/icons/device-phone-mobile";
import { Language } from "~/components/icons/language";
import { PresentationChartLine } from "~/components/icons/presentation-chart-line";
import { Users } from "~/components/icons/users";
import { getRecentConlangs } from "~/server/queries";
import { ConlangTable } from "./dashboard/_components/conlang-table";

async function RecentConlangs() {
  const recentConlangs = await getRecentConlangs();
  return (
    <div className="max-w-md flex-grow px-0.5 md:max-w-xl">
      <ConlangTable
        conlangs={recentConlangs}
        visibility={{
          isPublic: false,
          ownerId: false,
          createdAt: false,
          updatedAt: false,
          actions: false,
        }}
        className="bg-card/80"
      />
    </div>
  );
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
        <MessageCircleWarningIcon className="size-6 flex-shrink-0 text-accent-foreground" />
        <p className="max-w-lg text-center md:max-w-5xl">
          This website is currently in early development. Please be patient with
          any issues or bugs you encounter.
        </p>
      </div>
      <div
        id="features"
        className="flex flex-col items-center text-pretty text-left"
      >
        <h2 className="sr-only text-3xl font-bold">Features</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="group rounded-xl bg-accent p-6">
            <BookOpen className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Grow Your Dictionary</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Build your language&apos;s lexicon, grammar, and phonological
              inventory.
            </p>
          </div>
          <div className="group rounded-xl bg-accent p-6">
            <Users className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Collaborate</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Showcase your work and collaborate with others on your constructed
              languages.
            </p>
          </div>
          <div className="group relative rounded-xl bg-accent p-6 opacity-60">
            <AdjustmentsHorizontal className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Set Rules</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Customize what&apos;s permissible in your language, and get
              warnings if something breaks your rules.
            </p>
            <div className="absolute right-3 top-3 rounded-sm bg-slate-200 p-2 text-xs font-semibold tracking-tight dark:bg-slate-700">
              Coming soon!
            </div>
          </div>
          <div className="group relative rounded-xl bg-accent p-6 opacity-60">
            <Bolt className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Generate inflections</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Specify regular patterns for declensions and conjugations—and edit
              exceptions with ease.
            </p>
            <div className="absolute right-3 top-3 rounded-sm bg-slate-200 p-2 text-xs font-semibold tracking-tight dark:bg-slate-700">
              Coming soon!
            </div>
          </div>
          <div className="group relative rounded-xl bg-accent p-6 opacity-60">
            <PresentationChartLine className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Analyze</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              View insights into the frequency and usage of constituents.
            </p>
            <div className="absolute right-3 top-3 rounded-sm bg-slate-200 p-2 text-xs font-semibold tracking-tight dark:bg-slate-700">
              Coming soon!
            </div>
          </div>
          <div className="group rounded-xl bg-accent p-6">
            <DevicePhoneMobile className="mb-4 size-12 rounded-lg bg-card p-2 text-dictionary/80" />
            <h3 className="text-md mb-4 font-semibold">Access Anywhere</h3>
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Responsive design for access from mobile devices.
            </p>
          </div>
        </div>
      </div>
      <div
        id="recentConlangs"
        className="group/recent w-full rounded-xl bg-accent p-8 dark:bg-card"
      >
        <h2 className="mb-4 flex items-center justify-between gap-1 text-start text-xl font-semibold tracking-tight md:gap-8 md:text-xl">
          Share your conlangs with the world!
          <Earth className="size-16 rounded-lg bg-card p-2 text-muted-foreground transition-colors ease-in group-hover/recent:text-dictionary/90 dark:bg-accent" />
        </h2>
        <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground">
          Set your conlang as <em>Public</em> to allow anyone to view it, and
          share a link directly to your conlang with others. Check out some
          recently-updated languages here:
        </p>
        <div className="flex items-center justify-center">
          <Suspense fallback={<div className="h-96" />}>
            <RecentConlangs />
          </Suspense>
        </div>
        <div className="mt-4 flex w-full justify-center">
          <Link
            href="/search"
            className="inline-flex items-center rounded-md bg-dictionary px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-dictionary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-dictionary dark:text-white dark:hover:bg-dictionary/80"
          >
            View All Conlangs
          </Link>
        </div>
      </div>
      <div id="callToAction" className="group w-full rounded-xl bg-accent p-8">
        <h2 className="mb-4 flex items-center justify-between gap-1 text-start text-xl font-semibold tracking-tight md:gap-8 md:text-xl">
          Ready to create your own language?
          <Language className="size-16 rounded-lg bg-card p-2 text-muted-foreground transition-colors ease-in group-hover:text-dictionary/90" />
        </h2>
        <SignedOut>
          <p className="text-left text-sm font-medium text-muted-foreground">
            <Link
              href="/sign-up"
              className="text-secondary-foreground hover:underline hover:opacity-85"
            >
              Sign up
            </Link>{" "}
            to get started building!
          </p>
        </SignedOut>
        <SignedIn>
          <p className="text-left text-sm font-medium text-muted-foreground">
            Visit the{" "}
            <Link
              href="/dashboard"
              className="inline-flex items-baseline text-primary hover:underline hover:opacity-85"
            >
              <Dashboard className=" mr-1 size-4 translate-y-1" />
              dashboard
            </Link>{" "}
            to manage your conlangs.
          </p>
        </SignedIn>
      </div>
    </div>
  );
}

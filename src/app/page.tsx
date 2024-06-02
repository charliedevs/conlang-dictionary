import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { Dashboard } from "~/components/icons/dashboard";
import { getRecentConlangs } from "~/server/queries";
import { ConlangTable } from "./dashboard/_components/conlang-table";
import { BookOpen } from "~/components/icons/book-open";
import { Users } from "~/components/icons/users";
import { AdjustmentsHorizontal } from "~/components/icons/adjustments-horizontal";
import { PresentationChartLine } from "~/components/icons/presentation-chart-line";
import { DevicePhoneMobile } from "~/components/icons/device-phone-mobile";
import { Bolt } from "~/components/icons/bolt";
import { Language } from "~/components/icons/language";

async function RecentConlangs() {
  const recentConlangs = await getRecentConlangs();
  return (
    <div className="flex max-w-xs flex-col items-center justify-center px-0.5 md:max-w-xl">
      <h2 className="p-2 text-center text-xl font-medium text-muted-foreground ">
        Check out some languages here:
      </h2>
      <ConlangTable
        conlangs={recentConlangs}
        visibility={{
          description: false,
          isPublic: false,
          createdAt: false,
          updatedAt: false,
          actions: false,
        }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="max-w-2xl text-center text-5xl font-extrabold tracking-tight md:text-[4rem]">
        Build and share your <span className="text-dictionary">conlangs</span>
      </h1>
      <p className="mx-auto max-w-lg text-center text-lg text-muted-foreground md:max-w-xl md:text-xl">
        Craft the phonology, lexicon, and grammar of your language. Collaborate,
        refine, and harness your conlanging creativity with a suite of versatile
        tools.
      </p>
      <div
        id="features"
        className="flex max-w-[100rem] flex-col items-center text-pretty text-left"
      >
        <h2 className="sr-only text-3xl font-bold">Features</h2>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">
                Dictionary for your conlangs
              </h3>
              <BookOpen className="mb-2 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              Build your language&apos;s{" "}
              <span className="font-medium text-dictionary">lexicon</span>,{" "}
              <span className="font-medium text-dictionary">grammar</span>, and{" "}
              <span className="font-medium text-dictionary">phonological</span>{" "}
              inventory.
            </p>
          </div>
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">Share languages</h3>
              <Users className="mb-2 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              Showcase your work and{" "}
              <span className="font-medium text-dictionary">collaborate</span>{" "}
              with others on your constructed languages.
            </p>
          </div>
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">
                Define syntax & phonotactics
              </h3>
              <AdjustmentsHorizontal className="mb-3 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              Customize what&apos;s{" "}
              <span className="font-medium text-dictionary">permissible</span>{" "}
              in your language, from allowed sound combinations to syntactical
              rules.
            </p>
          </div>
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">
                Auto-generate inflections
              </h3>
              <Bolt className="mb-2 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              Specify regular patterns for{" "}
              <span className="font-medium text-dictionary">declensions</span>{" "}
              and{" "}
              <span className="font-medium text-dictionary">conjugations</span>,
              —and edit exceptions with ease.
            </p>
          </div>
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">Analyze your data</h3>
              <PresentationChartLine className="mb-1 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              View insights into the{" "}
              <span className="font-medium text-dictionary">frequency</span> and{" "}
              <span className="font-medium text-dictionary">usage</span> of your
              noun classes, morphemes, phonemes, and orthographic choices.
            </p>
          </div>
          <div className="group rounded-lg border p-6 opacity-80 shadow-lg transition-all ease-in hover:opacity-100 hover:shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="mb-2 text-xl font-semibold">Responsive design</h3>
              <DevicePhoneMobile className="mb-2 h-8 w-8 min-w-8 transition-colors ease-in group-hover:text-dictionary" />
            </div>
            <p>
              Access from{" "}
              <span className="font-medium text-dictionary">any device</span>,{" "}
              from your computer to your phone, with a consistent &amp; reliable
              experience.
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-around gap-4 md:flex-row">
        <div id="recentConlangs" className="mt-5">
          <RecentConlangs />
        </div>
        <div
          id="callToAction"
          className="group max-w-sm rounded-lg border border-border bg-primary-foreground p-8 md:max-w-md"
        >
          <h2 className="mb-5 flex items-center gap-6 text-start text-2xl font-semibold md:gap-8 md:text-4xl">
            <span className="text-muted-foreground transition ease-in group-hover:text-foreground">
              <Language className="size-10 md:size-20" />
            </span>
            Ready to create your own language?
          </h2>
          <SignedOut>
            <p className="text-center text-lg font-medium text-muted-foreground md:text-2xl">
              <Link
                href="/sign-up"
                className="text-dictionary hover:underline hover:opacity-85"
              >
                Sign up
              </Link>{" "}
              to get started building!
            </p>
          </SignedOut>
          <SignedIn>
            <p className="text-center text-lg font-medium text-muted-foreground md:text-2xl">
              Visit the{" "}
              <Link
                href="/dashboard"
                className="inline-flex items-baseline text-dictionary hover:underline hover:opacity-85"
              >
                <Dashboard className=" mr-1 h-6 w-6 translate-y-1" />
                dashboard
              </Link>{" "}
              to manage your conlangs.
            </p>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

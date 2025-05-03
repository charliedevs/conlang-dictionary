import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { AddWordForm } from "./forms/add-word";
import { WordList } from "./word-list";
import { WordView } from "./word-view";

function ViewAllWordsButton() {
  return (
    <Button variant="ghost" className="not-sr-only md:sr-only">
      <ChevronLeftIcon className="mr-1 size-4" /> All Words
    </Button>
  );
}

function AddWord(props: { conlangId: number; wordId?: number }) {
  return (
    <div
      className={cn(
        "not-sr-only flex w-full justify-center md:block",
        props.wordId && "sr-only md:not-sr-only",
      )}
    >
      <AddWordForm
        conlangId={props.conlangId}
        afterSubmit={async (newWordId) => {
          "use server";
          redirect(`/lang/${props.conlangId}/?view=lexicon&word=${newWordId}`);
        }}
      />
    </div>
  );
}

export function Lexicon(props: {
  conlang: Conlang;
  wordId?: number;
  searchParams: LanguagePageSearchParams;
}) {
  const isConlangOwner = props.conlang.ownerId === auth().userId;
  return (
    <div id="lexicon" className="flex flex-col">
      <div
        id="actions"
        className="mt-3 flex items-center justify-between gap-2 p-1 md:mt-0"
      >
        {isConlangOwner && (
          <AddWord conlangId={props.conlang.id} wordId={props.wordId} />
        )}
        {Boolean(props.wordId) && (
          <Link href={`/lang/${props.conlang.id}/?view=lexicon`}>
            <ViewAllWordsButton />
          </Link>
        )}
      </div>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside
          className={cn(
            "fixed top-14 z-30 -ml-2 hidden w-full shrink-0 md:sticky md:block",
            isConlangOwner ? "h-[calc(74vh-3.5rem)]" : "h-[calc(80vh-3.5rem)]",
          )}
        >
          <Suspense fallback={<div className="h-full">Loading...</div>}>
            <WordList conlang={props.conlang} selectedWordId={props.wordId} />
          </Suspense>
        </aside>
        <article className="relative py-5">
          {props.wordId ? (
            <Suspense
              fallback={<div className="py-5 text-center">Loading...</div>}
            >
              <WordView
                wordId={props.wordId}
                isConlangOwner={isConlangOwner}
                searchParams={props.searchParams}
              />
            </Suspense>
          ) : (
            <>
              <div className="not-sr-only w-full max-w-[220px] md:sr-only">
                <Suspense
                  fallback={<div className="py-5 text-center">Loading...</div>}
                >
                  <WordList
                    conlang={props.conlang}
                    selectedWordId={props.wordId}
                  />
                </Suspense>
              </div>
              <div className="sr-only md:not-sr-only">
                <div className="flex items-center justify-center rounded-md bg-accent p-8 text-muted-foreground">
                  <ArrowLeftIcon className="mr-2 size-5 opacity-50" />
                  Select a word to view.
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}

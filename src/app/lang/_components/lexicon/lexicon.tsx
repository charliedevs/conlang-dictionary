import { auth } from "@clerk/nextjs/server";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { AddWordForm } from "./add-word";
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

export function Lexicon(props: { conlang: Conlang; wordId?: number }) {
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
              <WordView wordId={props.wordId} isConlangOwner={isConlangOwner} />
            </Suspense>
          ) : (
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
          )}
        </article>
      </div>
    </div>
  );
}

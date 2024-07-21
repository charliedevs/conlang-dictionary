import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { AddWordForm } from "./add-word";
import { Word } from "./word";
import { WordList } from "./word-list";

export function Lexicon(props: { conlang: Conlang; wordId?: number }) {
  const isConlangOwner = props.conlang.ownerId === auth().userId;
  return (
    <div id="lexicon" className="flex flex-col">
      {isConlangOwner && (
        <div className="flex gap-2 p-1">
          <AddWordForm
            conlangId={props.conlang.id}
            afterSubmit={async (newWordId) => {
              "use server";
              redirect(
                `/language/${props.conlang.id}/?view=lexicon&word=${newWordId}`,
              );
            }}
          />
        </div>
      )}
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
              <Word wordId={props.wordId} />
            </Suspense>
          ) : null}
        </article>
      </div>
    </div>
  );
}

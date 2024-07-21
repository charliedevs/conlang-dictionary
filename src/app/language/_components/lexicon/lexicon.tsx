import { Suspense } from "react";
import { type Conlang } from "~/types/conlang";
import { Word } from "./word";
import { WordList } from "./word-list";

export function Lexicon(props: { conlang: Conlang; wordId?: number }) {
  return (
    <div
      id="lexicon"
      className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
    >
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(80vh-3.5rem)] w-full shrink-0 md:sticky md:block">
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
  );
}

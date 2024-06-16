"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type Word } from "~/types/word";
import { WordView } from "./word-view";

function WordList(props: {
  words: Word[];
  conlangName: string;
  selectedWord: Word | null;
  setSelectedWord: Dispatch<SetStateAction<Word | null>>;
}) {
  if (props.words.length < 1)
    return <div className="py-5 text-center">No words added yet.</div>;
  return (
    <ScrollArea className="min-h-0 flex-grow overflow-auto rounded-md border bg-card/90 p-3 [&>div]:max-h-[calc(95vh-325px)]">
      <ul className="flex flex-col gap-3">
        {props.words.map((word) => (
          <li
            key={word.id}
            onClick={() =>
              props.setSelectedWord((prev) =>
                word.id === prev?.id ? null : word,
              )
            }
            className={cn(
              "flex flex-col rounded-md p-2 transition-all ease-in hover:cursor-pointer hover:bg-secondary",
              props.selectedWord?.id === word.id
                ? "bg-slate-400/40 hover:bg-slate-400/30"
                : "",
            )}
          >
            <div className="flex items-baseline gap-5">
              <div className="text-md font-bold">{word.text}</div>
              <div className="text-xs">{word.pronunciation}</div>
            </div>
            <div className="text-xs">{word.gloss}</div>
            <div className="whitespace-pre-wrap text-sm">{word.definition}</div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export function Lexicon(props: {
  conlang: Conlang;
  words: Word[];
  isConlangOwner: boolean;
}) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  return (
    <div id="lexicon" className="flex gap-4">
      <WordList
        words={props.words}
        conlangName={props.conlang.name}
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
      />
      <WordView
        word={selectedWord}
        setSelectedWord={setSelectedWord}
        isConlangOwner={props.isConlangOwner}
      />
    </div>
  );
}

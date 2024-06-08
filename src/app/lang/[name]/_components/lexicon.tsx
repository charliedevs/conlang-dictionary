"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type Word } from "~/types/word";
import { EditWordForm } from "./edit-word-form";

function WordList(props: {
  words: Word[];
  conlangName: string;
  selectedWord: Word | null;
  setSelectedWord: Dispatch<SetStateAction<Word | null>>;
}) {
  if (props.words.length < 1)
    return <div className="py-5 text-center">No words added yet.</div>;
  return (
    <ScrollArea className="min-h-0 flex-grow overflow-auto rounded-md border border-border p-3 [&>div]:max-h-[calc(95vh-325px)]">
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

function WordDetails(props: {
  word: Word | null;
  setSelectedWord: Dispatch<SetStateAction<Word | null>>;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (isDesktop && props.word) {
    return (
      <div className="min-w-[50vw]">
        <EditWordForm word={props.word} />
      </div>
    );
  }
  return (
    <Sheet
      open={Boolean(props.word)}
      onOpenChange={() => props.setSelectedWord(null)}
    >
      <SheetContent className="flex w-[80vw] flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Edit Word</SheetTitle>
          <SheetDescription>Change or add word details.</SheetDescription>
        </SheetHeader>
        {props.word ? <EditWordForm word={props.word} /> : null}
      </SheetContent>
    </Sheet>
  );
}

export function Lexicon(props: { conlang: Conlang; words: Word[] }) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  return (
    <div id="lexicon" className="flex gap-4">
      <WordList
        words={props.words}
        conlangName={props.conlang.name}
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
      />
      <WordDetails word={selectedWord} setSelectedWord={setSelectedWord} />
    </div>
  );
}

"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { type Conlang } from "~/types/conlang";
import { type Word } from "~/types/word";

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
              props.setSelectedWord((prev) => (word === prev ? null : word))
            }
            className="flex flex-col rounded-md p-2 hover:cursor-pointer hover:bg-secondary"
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
  if (isDesktop && Boolean(props.word)) {
    return <div className="w-[50vw] bg-slate-400">{props.word?.text}</div>;
  }
  return (
    <Sheet
      open={Boolean(props.word)}
      onOpenChange={() => props.setSelectedWord(null)}
    >
      <SheetContent className="w-[80vw]">
        <SheetHeader>
          <SheetTitle>{props.word?.text}</SheetTitle>
          <SheetDescription>description</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value="Pedro Duarte" />
          <Label htmlFor="username">Username</Label>
          <Input id="username" value="@peduarte" className="col-span-3" />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
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

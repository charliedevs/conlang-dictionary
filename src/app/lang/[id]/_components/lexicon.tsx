"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useKeyboardNavigation } from "~/hooks/accessibility/useKeyboardNavigation";
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
  const listRef = useRef<HTMLUListElement>(null);
  const { focusedItemIndex, setFocusedItemIndex } = useKeyboardNavigation(
    props.words.length,
    "word",
    listRef,
  );
  if (props.words.length < 1)
    return <div className="py-5 text-center">No words added yet.</div>;
  return (
    <ScrollArea className="max-h-[max(calc(95vh-325px),_700px)] min-h-0 min-w-[min(500px,_40vw)] flex-grow overflow-auto rounded-md border bg-card/90 p-3 [&>div]:max-h-[max(calc(95vh-325px),_700px)]">
      <ul className="flex flex-grow flex-col gap-1" tabIndex={0} ref={listRef}>
        {props.words.map((word, idx) => (
          <li
            id={`word-${idx}`}
            key={word.id}
            tabIndex={idx === focusedItemIndex ? 0 : -1}
            onFocus={() => setFocusedItemIndex(idx)}
            onClick={() => {
              props.setSelectedWord((prev) =>
                word.id === prev?.id ? null : word,
              );
              setFocusedItemIndex(idx);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.setSelectedWord((prev) =>
                  word.id === prev?.id ? null : word,
                );
                setFocusedItemIndex(idx);
              }
            }}
            className={cn(
              "m-0.5 flex flex-col rounded-md p-2 transition-all ease-in hover:cursor-pointer hover:bg-secondary focus:outline-border",
              props.selectedWord?.id === word.id
                ? "bg-slate-400/40 hover:bg-slate-400/30"
                : "",
            )}
          >
            <div className="flex h-8 items-center gap-5">
              <span className="text-md font-bold">{word.text}</span>
              <span className="text-[0.7rem] text-muted-foreground">
                {word.sections && word.sections.length > 0
                  ? word.sections
                      .map((s) => s.lexicalCategory?.category)
                      .join(", ")
                  : ""}
              </span>
            </div>
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
  // Update state if selectedWord changes on the server
  const selectedWordFromServer = props.words.find(
    (w) => w.id === selectedWord?.id,
  );
  useEffect(() => {
    if (selectedWord && selectedWordFromServer) {
      setSelectedWord(selectedWordFromServer);
    }
  }, [selectedWord, selectedWordFromServer]);
  return (
    <div id="lexicon" className="flex gap-4">
      <WordList
        words={props.words}
        conlangName={props.conlang.name}
        selectedWord={selectedWord}
        setSelectedWord={setSelectedWord}
      />
      <WordView
        key={selectedWord?.id ?? 0}
        word={selectedWord}
        conlangName={props.conlang.name}
        isConlangOwner={props.isConlangOwner}
        setSelectedWord={setSelectedWord}
      />
    </div>
  );
}

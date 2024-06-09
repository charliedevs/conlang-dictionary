"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { type Word } from "~/types/word";
import { EditWordForm } from "./forms/edit-word-form";

function WordDetails(props: { word: Word }) {
  const { word: w } = props;
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-start text-2xl font-medium">{w.text}</h3>
      <p className="text-sm text-muted-foreground">{w.definition}</p>
      <div className="flex flex-col gap-2">
        {w.pronunciation && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium">Pronunciation</div>
            <div className="text-xs">{w.pronunciation}</div>
          </div>
        )}
        {w.gloss && (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium">Gloss</div>
            <div className="text-xs">{w.gloss}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditWordButton(props: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex">
      <Button
        variant="outline"
        onClick={() => props.setIsEditing(true)}
        className="w-full"
      >
        Edit Word
      </Button>
    </div>
  );
}

export function WordView(props: {
  word: Word | null;
  setSelectedWord: Dispatch<SetStateAction<Word | null>>;
  isConlangOwner: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Desktop view
  if (isDesktop && props.word) {
    if (!isEditing) {
      return (
        <div className="flex min-w-[50vw] flex-col gap-4">
          <WordDetails word={props.word} />
          {props.isConlangOwner && (
            <EditWordButton setIsEditing={setIsEditing} />
          )}
        </div>
      );
    }
    return (
      <div className="min-w-[50vw]">
        <EditWordForm
          word={props.word}
          afterSubmit={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Mobile view
  if (!isEditing) {
    return (
      <Sheet
        open={Boolean(props.word)}
        onOpenChange={() => props.setSelectedWord(null)}
      >
        <SheetContent className="flex w-[80vw] flex-col gap-6">
          <SheetHeader>
            <SheetTitle>Word Details</SheetTitle>
          </SheetHeader>
          {props.word ? <WordDetails word={props.word} /> : null}
          {props.isConlangOwner && (
            <EditWordButton setIsEditing={setIsEditing} />
          )}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Sheet
      open={Boolean(props.word)}
      onOpenChange={() => props.setSelectedWord(null)}
    >
      <SheetContent className="flex w-[80vw] flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Edit Word</SheetTitle>
          <SheetDescription>Change or add word details.</SheetDescription>
        </SheetHeader>
        {props.word ? (
          <EditWordForm
            word={props.word}
            afterSubmit={() => setIsEditing(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

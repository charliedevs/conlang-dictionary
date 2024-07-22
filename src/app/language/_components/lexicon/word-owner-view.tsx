"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Separator } from "~/components/ui/separator";
import { type Word } from "~/types/word";
import { DeleteWord } from "./delete-word";
import { EditWordButton, EditWordForm } from "./edit-word";

export function WordOwnerView(props: { word: Word }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  return (
    <div id="word" className="flex flex-col gap-1">
      {isEditing ? (
        <EditWordForm
          word={props.word}
          afterSubmit={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div
          id="word-header"
          className="group/header flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">{props.word.text}</h2>
            <EditWordButton onClick={() => setIsEditing(true)} />
          </div>
          <DeleteWord
            word={props.word}
            afterDelete={() =>
              router.push(`/language/${props.word.conlangId}/?view=lexicon`)
            }
          />
        </div>
      )}
      <Separator />
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { getConlangByName, getWordsByConlangId } from "~/server/queries";
import { AddWordButton } from "./_components/add-word-button";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { ScrollArea } from "~/components/ui/scroll-area";

async function WordList(props: { conlangId: number; conlangName: string }) {
  const words = await getWordsByConlangId(props.conlangId);
  if (words.length < 1)
    return <div className="py-5 text-center">No words added yet.</div>;
  return (
    <ScrollArea className="min-h-0 max-w-md overflow-auto rounded-md border border-border p-3 [&>div]:max-h-[calc(100vh-310px)]">
      <div className="flex flex-col gap-3">
        {words.map((word) => (
          <Link
            key={word.id}
            href={`/lang/${props.conlangName}/${word.id}`}
            className="flex flex-col rounded-md p-2 hover:cursor-pointer hover:bg-secondary"
          >
            <div className="flex items-baseline gap-5">
              <div className="text-md font-bold">{word.text}</div>
              <div className="text-xs">{word.pronunciation}</div>
            </div>
            <div className="text-xs">{word.gloss}</div>
            <div className="whitespace-pre-wrap text-sm">{word.definition}</div>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}

interface ConlangPageProps {
  params: { name: string };
}

export default async function ConlangPage({ params }: ConlangPageProps) {
  let conlang;
  try {
    conlang = await getConlangByName(params.name);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Language not found.</div>;
  }
  // check conlang ownerId and check if signed in user matches
  const isConlangOwner = conlang.ownerId === auth().userId;
  return (
    <div className="container flex flex-col gap-4 px-5 pb-1 pt-5">
      <Breadcrumbs name={params.name} />
      <div id="conlangInfo" className="flex flex-col gap-1">
        <h1 className="text-start text-2xl font-medium">{params.name}</h1>
        <p>{conlang.description}</p>
      </div>
      <div className="mx-auto flex w-96 max-w-full justify-start">
        {isConlangOwner && <AddWordButton conlangId={conlang.id} />}
      </div>
      <div id="words" className="mx-auto w-96 max-w-full">
        <WordList conlangId={conlang.id} conlangName={params.name} />
      </div>
    </div>
  );
}

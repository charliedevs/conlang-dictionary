import { SignedIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { getConlangByName, getWordsByConlangId } from "~/server/queries";
import { AddWordButton } from "./_components/add-word-button";

async function WordList(props: { conlangId: number }) {
  const words = await getWordsByConlangId(props.conlangId);
  return (
    <div className="flex flex-col gap-1 p-3">
      {words.map((word) => (
        <div
          key={word.id}
          className="flex h-8 w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="flex-shrink">{word.text}</div>
            <div className="flex-shrink">{word.pronunciation}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-shrink">{word.gloss}</div>
            <div className="flex-shrink">{word.definition}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ConlangPageProps {
  params: { name: string };
}

export default async function ConlangPage({ params }: ConlangPageProps) {
  // TODO: fetch conlang data from database
  const conlang = await getConlangByName(params.name);
  // check conlang ownerId and check if signed in user matches
  const isConlangOwner = conlang.ownerId === auth().userId;
  return (
    <div className="flex flex-col p-5">
      <SignedIn>
        <div className="flex w-full justify-start">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{params.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </SignedIn>

      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-14">
        <h1 className="text-center text-2xl font-medium">{params.name}</h1>
        <p>{conlang.description}</p>
        {isConlangOwner && <AddWordButton conlangId={conlang.id} />}
        <WordList conlangId={conlang.id} />
      </div>
    </div>
  );
}

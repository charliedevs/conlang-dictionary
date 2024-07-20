import { auth } from "@clerk/nextjs/server";

import { getConlangById, getWordsByConlangId } from "~/server/queries";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { AddWordButton } from "./_components/forms/add-word-button";
import { Lexicon } from "./_components/lexicon";

interface ConlangPageProps {
  params: { id: string };
}

export default async function ConlangPage({ params }: ConlangPageProps) {
  const conlangId = Number(params.id);
  let conlang;
  try {
    conlang = await getConlangById(conlangId);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Language not found.</div>;
  }
  const words = await getWordsByConlangId(conlang.id);
  const isConlangOwner = conlang.ownerId === auth().userId;
  return (
    <div className="container flex flex-col gap-4 px-5 pb-1 pt-5">
      <Breadcrumbs name={conlang.name} isConlangOwner={isConlangOwner} />
      <div id="conlangInfo" className="flex flex-col gap-1">
        <h1 className="text-start text-2xl font-medium">{conlang.name}</h1>
        <p>{conlang.description}</p>
      </div>
      {isConlangOwner && <AddWordButton conlangId={conlang.id} />}
      <Lexicon
        conlang={conlang}
        words={words}
        isConlangOwner={isConlangOwner}
      />
    </div>
  );
}

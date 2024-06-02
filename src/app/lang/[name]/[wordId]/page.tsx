import { auth } from "@clerk/nextjs/server";

import { getConlangByName, getWordById } from "~/server/queries";

interface WordPageProps {
  params: { name: string; wordId: string };
}

// TODO: Maybe make the word 'page' a client component that takes the word
//       from the wordlist to reduce queries and improve responsiveness.
//       On moblie, it could replace the content of conlang page and have
//       a back button, but on desktop, it could display beside the wordlist.
export default async function WordPage({ params }: WordPageProps) {
  let conlang;
  try {
    conlang = await getConlangByName(params.name);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Language not found.</div>;
  }
  const isConlangOwner = conlang.ownerId === auth().userId;
  let word;
  try {
    word = await getWordById(Number(params.wordId));
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Word not found.</div>;
  }

  console.log(isConlangOwner);

  return <>{word.text}</>;
}

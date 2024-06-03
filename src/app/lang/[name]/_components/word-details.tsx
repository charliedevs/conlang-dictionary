import { getWordById } from "~/server/queries";
import { type Conlang } from "~/types/conlang";

export async function WordDetails(props: {
  conlang: Conlang;
  isConlangOwner: boolean;
  wordId: number;
}) {
  let word;
  try {
    word = await getWordById(Number(props.wordId));
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-5 text-center">Word not found.</div>;
  }

  return <div>{word.text}</div>;
}

import { Separator } from "~/components/ui/separator";
import { getWordById } from "~/server/queries";

export async function Word(props: { wordId: number }) {
  const word = await getWordById(props.wordId);
  return (
    <div id="word" className="flex flex-col gap-2">
      <div id="word-header">
        <h2 className="text-2xl font-medium">{word.text}</h2>
        <Separator className="my-1" />
      </div>
    </div>
  );
}

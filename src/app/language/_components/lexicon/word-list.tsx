import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { getWordsByConlangId } from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { AddWordForm } from "./add-word";

export async function WordList(props: {
  conlang: Conlang;
  selectedWordId?: number;
}) {
  let words = [];
  try {
    words = await getWordsByConlangId(props.conlang.id);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading words.</div>;
  }
  const isConlangOwner = props.conlang.ownerId === auth().userId;
  return (
    <div className="flex flex-col py-4 pr-6">
      {isConlangOwner && <AddWordForm conlangId={props.conlang.id} />}
      <ScrollArea id="word-list" className="h-full">
        {words.length < 1 && (
          <div className="italic text-muted-foreground">
            No words added yet.
          </div>
        )}
        {words.map((word) => (
          <Link
            key={word.id}
            href={`/language/${props.conlang.id}/?view=lexicon&word=${word.id}`}
            className={cn(
              "inline-block w-full max-w-[200px] items-center overflow-x-hidden text-ellipsis rounded-md border border-transparent py-1 text-muted-foreground hover:underline",
              props.selectedWordId === word.id
                ? "font-semibold text-primary"
                : "",
            )}
          >
            {word.text}
          </Link>
        ))}
      </ScrollArea>
    </div>
  );
}

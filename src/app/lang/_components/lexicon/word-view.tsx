import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getWordById } from "~/server/queries";
import type { Word } from "~/types/word";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { renderSection } from "./section-views";
import { WordViewEdit } from "./word-view-edit";

export async function WordView(props: {
  wordId: number;
  isConlangOwner: boolean;
  searchParams?: LanguagePageSearchParams;
}) {
  let word: Word;
  try {
    word = await getWordById(props.wordId);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading word.</div>;
  }

  const isEditMode =
    props.searchParams?.edit === "true" || word.lexicalSections.length === 0;

  const editSearchParams = new URLSearchParams(props.searchParams ?? {});
  editSearchParams.set("edit", "true");

  if (isEditMode) {
    return <WordViewEdit word={word} />;
  }

  return (
    <div id="word" className="flex flex-col gap-1">
      <div id="word-header" className="flex items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <h2 className="text-2xl font-medium">{word.text}</h2>
          {props.isConlangOwner && !isEditMode && (
            <Link href={`?${editSearchParams.toString()}`}>
              <Button variant="ghost" size="sm" className="h-8">
                <Edit2Icon className="mr-2 h-3 w-3" /> Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Separator />
      <div className="my-2 flex flex-col gap-2">
        {word.lexicalSections.map((section) => (
          <div key={section.id}>{renderSection(section)}</div>
        ))}
      </div>
    </div>
  );
}

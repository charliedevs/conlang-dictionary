import parseHtml from "html-react-parser";
import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getWordById } from "~/server/queries";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { WordViewEdit } from "./word-view-edit";

export async function WordView(props: {
  wordId: number;
  isConlangOwner: boolean;
  searchParams?: LanguagePageSearchParams;
}) {
  let word;
  try {
    word = await getWordById(props.wordId);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading word.</div>;
  }

  const isEditMode =
    props.searchParams?.edit === "true" || word.wordSections.length === 0;

  if (props.isConlangOwner && isEditMode) {
    return <WordViewEdit word={word} />;
  }

  const editSearchParams = new URLSearchParams(props.searchParams ?? {});
  editSearchParams.set("edit", "true");

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
      <div className="my-2 flex flex-col gap-1">
        {word.wordSections.map((section) => {
          const category = section?.definitionSection?.lexicalCategory.category;
          const sectionTitle = section.title
            ? category && category !== section.title
              ? `${section.title} (${category})`
              : section.title
            : (category ?? "");

          return (
            <div key={section.id}>
              <h3 className="mb-2 text-lg font-bold">{sectionTitle}</h3>
              <h4 className="text-sm font-bold">{word.text}</h4>
              <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
                {section.definitionSection?.definitions?.map((d) => (
                  <li key={d.id} className="pb-2">
                    <div>{parseHtml(d.text)}</div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

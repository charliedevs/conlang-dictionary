import parseHtml from "html-react-parser";
import { Separator } from "~/components/ui/separator";
import { getWordById } from "~/server/queries";
import { WordOwnerView } from "./word-owner-view";

export async function WordView(props: {
  wordId: number;
  isConlangOwner: boolean;
}) {
  let word;
  try {
    word = await getWordById(props.wordId);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading word.</div>;
  }
  if (props.isConlangOwner) {
    return <WordOwnerView word={word} />;
  }
  return (
    <div id="word" className="flex flex-col gap-1">
      <div id="word-header" className="flex items-center gap-2">
        <h2 className="text-2xl font-medium">{word.text}</h2>
      </div>
      <Separator />
      <div className="my-2 flex flex-col gap-1">
        {word.wordSections.map((section) => (
          <div key={section.id}>
            <h3 className="mb-2 text-lg font-bold">
              {section.title ??
                section?.definitionSection.lexicalCategory.category ??
                ""}
            </h3>
            <h4 className="text-sm font-bold">{word.text}</h4>
            <ol className="m-2 list-decimal pl-2 text-[0.825rem] text-primary/80 sm:text-[0.85rem] md:ml-4 md:p-3 md:pl-4 md:text-sm">
              {section.definitionSection?.definitions?.map((d) => (
                <li key={d.id} className="pb-2">
                  <div>{parseHtml(d.text)}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

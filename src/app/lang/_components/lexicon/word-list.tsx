import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { getWordsByConlangId } from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface WordListProps {
  conlang: Conlang;
  selectedWordId?: number;
  searchParams?: LanguagePageSearchParams;
}

function wordMatchesSearch(
  word: { text: string },
  search: string | undefined,
): boolean {
  if (!search) return true;
  return word.text.toLowerCase().includes(search.toLowerCase());
}

export async function WordList(props: WordListProps) {
  let words = [];
  try {
    words = await getWordsByConlangId(props.conlang.id);
  } catch (error) {
    console.error("Error:", error);
    return <div className="py-4 text-center">Error loading words.</div>;
  }

  const search =
    typeof props.searchParams?.q === "string"
      ? props.searchParams.q
      : undefined;
  const hasSearchFilter = Boolean(search);
  const filteredWords = hasSearchFilter
    ? words.filter((word) => wordMatchesSearch(word, search))
    : words;
  const noSearchResults = filteredWords.length < 1 && words.length > 0;

  return (
    <ScrollArea id="word-list" className="h-full py-4 pr-6">
      {hasSearchFilter && (
        <div className="mb-2 text-xs text-muted-foreground">
          Search Results:
        </div>
      )}
      {words.length < 1 ? (
        <div className="italic text-muted-foreground">No words added yet.</div>
      ) : (
        noSearchResults && (
          <div className="italic text-muted-foreground">No words found.</div>
        )
      )}
      {filteredWords.map((word) => {
        const params = new URLSearchParams(props.searchParams);
        params.set("word", String(word.id));
        return (
          <Link
            key={word.id}
            href={`/lang/${props.conlang.id}/?${params.toString()}`}
            className={cn(
              "inline-block w-full max-w-[200px] items-center overflow-x-hidden text-ellipsis rounded-md border border-transparent py-3 text-lg hover:underline md:py-1 md:text-base md:text-muted-foreground",
              props.selectedWordId === word.id
                ? "font-semibold md:text-primary"
                : "",
            )}
          >
            {word.text}
          </Link>
        );
      })}
    </ScrollArea>
  );
}

import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  getLexicalCategoriesForConlang,
  getWordsByConlangId,
} from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface LexicalCategoryViewProps {
  conlang: Conlang;
  categoryId: number;
  searchParams: LanguagePageSearchParams;
}

export async function LexicalCategoryView(props: LexicalCategoryViewProps) {
  const [lexicalCategories, words] = await Promise.all([
    getLexicalCategoriesForConlang(props.conlang.id),
    getWordsByConlangId(props.conlang.id),
  ]);

  const category = lexicalCategories.find((c) => c.id === props.categoryId);
  if (!category) {
    return <div>Category not found</div>;
  }

  const wordsInCategory = words.filter((word) =>
    word.lexicalSections.some(
      (section) =>
        section.sectionType === "definition" &&
        (section.properties as { lexicalCategoryId?: number })
          ?.lexicalCategoryId === props.categoryId,
    ),
  );

  const params = new URLSearchParams(props.searchParams);
  params.delete("category");

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/lang/${props.conlang.id}/?${params.toString()}`}>
            <ChevronLeftIcon className="size-4" />
            <div className="sr-only">Back to Lexical Categories</div>
          </Link>
        </Button>
        <h2 className="text-sm font-medium">{category.category}</h2>
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {wordsInCategory.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No words in this category yet.
            </div>
          ) : (
            <div className="grid gap-2">
              {wordsInCategory.map((word) => {
                const wordParams = new URLSearchParams(props.searchParams);
                wordParams.set("view", "lexicon");
                wordParams.set("word", word.id.toString());
                return (
                  <Link
                    key={word.id}
                    href={`/lang/${props.conlang.id}/?${wordParams.toString()}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50"
                  >
                    <span>{word.text}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  getLexicalCategoriesForConlang,
  getLexicalCategoryWordCounts,
} from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface LexicalCategoriesProps {
  conlang: Conlang;
  searchParams?: LanguagePageSearchParams;
}

export async function LexicalCategories(props: LexicalCategoriesProps) {
  const params = new URLSearchParams(props.searchParams);
  params.delete("grammar");

  const [lexicalCategories, wordCounts] = await Promise.all([
    getLexicalCategoriesForConlang(props.conlang.id),
    getLexicalCategoryWordCounts(props.conlang.id),
  ]);

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex items-center gap-1">
        <Link href={`/lang/${props.conlang.id}/?${params.toString()}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon className="size-4" />
            <div className="sr-only">Back</div>
          </Button>
        </Link>
        <h2 className="text-sm font-medium">Lexical Categories</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lexicalCategories.map((category) => {
          const categoryParams = new URLSearchParams(props.searchParams);
          categoryParams.set("grammar", "lexicalcategories");
          categoryParams.set("category", category.id.toString());

          return (
            <Link
              key={category.id}
              href={`/lang/${props.conlang.id}/?${categoryParams.toString()}`}
              className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              role="button"
              aria-label={`View words in ${category.category}`}
              aria-describedby={`category-count-${category.id}`}
            >
              <div className="text-sm font-medium text-muted-foreground">
                {category.category}
              </div>
              <div
                id={`category-count-${category.id}`}
                className="text-2xl font-bold"
              >
                {wordCounts.get(category.id) ?? 0}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

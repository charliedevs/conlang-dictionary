import { ShapesIcon } from "lucide-react";
import {
  getLexicalCategoriesForConlang,
  getLexicalCategoryWordCounts,
} from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { LexicalCategoryView } from "./lexical-category-view";
import {
  GrammarEmptyState,
  GrammarSectionHeader,
  ListPanel,
  RowLink,
} from "./grammar-ui";

interface LexicalCategoriesProps {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}

function wordCountLabel(count: number) {
  return count === 1 ? "1 word" : `${count} words`;
}

export async function LexicalCategories(props: LexicalCategoriesProps) {
  const selectedCategoryId = props.searchParams?.category
    ? Number(props.searchParams.category)
    : undefined;

  if (selectedCategoryId) {
    return (
      <LexicalCategoryView
        conlang={props.conlang}
        categoryId={selectedCategoryId}
        searchParams={props.searchParams}
      />
    );
  }

  const backParams = new URLSearchParams(props.searchParams);
  backParams.delete("grammar");
  const backHref = `/lang/${props.conlang.id}/?${backParams.toString()}`;

  const [lexicalCategories, wordCounts] = await Promise.all([
    getLexicalCategoriesForConlang(props.conlang.id),
    getLexicalCategoryWordCounts(props.conlang.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <GrammarSectionHeader
        title="Lexical Categories"
        backHref={backHref}
        backLabel="Back to Grammar"
        meta={
          lexicalCategories.length > 0
            ? `${lexicalCategories.length} total`
            : undefined
        }
      />

      {lexicalCategories.length === 0 ? (
        <GrammarEmptyState
          icon={<ShapesIcon className="size-5" />}
          title="No lexical categories yet"
          description="Lexical categories are the parts of speech — noun, verb, adjective — you assign to a word's definition. Add a definition to a word and choose its category to see it grouped here."
        />
      ) : (
        <ListPanel>
          {lexicalCategories.map((category) => {
            const categoryParams = new URLSearchParams(props.searchParams);
            categoryParams.set("grammar", "lexicalcategories");
            categoryParams.set("category", category.id.toString());
            const count = wordCounts.get(category.id) ?? 0;

            return (
              <RowLink
                key={category.id}
                href={`/lang/${props.conlang.id}/?${categoryParams.toString()}`}
                label={category.category}
                meta={wordCountLabel(count)}
                ariaLabel={`View ${wordCountLabel(count)} in ${category.category}`}
              />
            );
          })}
        </ListPanel>
      )}
    </div>
  );
}

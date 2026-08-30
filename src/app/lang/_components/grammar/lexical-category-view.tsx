import { InboxIcon } from "lucide-react";
import { definitionSnippet } from "~/lib/lexical-categories/definition-snippet";
import { filterWordsInCategory } from "~/lib/lexical-categories/membership";
import {
  getLexicalCategoriesForConlang,
  getWordsByConlangId,
} from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import {
  GrammarEmptyState,
  GrammarSectionHeader,
  ListPanel,
  RowLink,
} from "./grammar-ui";

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

  // Back link returns to the category list (drops `category`, keeps `grammar`).
  const backParams = new URLSearchParams(props.searchParams);
  backParams.delete("category");
  const backHref = `/lang/${props.conlang.id}/?${backParams.toString()}`;

  const category = lexicalCategories.find((c) => c.id === props.categoryId);
  if (!category) {
    return (
      <div className="flex flex-col gap-4">
        <GrammarSectionHeader
          title="Category not found"
          backHref={backHref}
          backLabel="Back to Lexical Categories"
        />
        <GrammarEmptyState
          icon={<InboxIcon className="size-5" />}
          title="This category no longer exists"
          description="It may have been renamed or removed. Head back to see the current lexical categories."
        />
      </div>
    );
  }

  const wordsInCategory = filterWordsInCategory(words, props.categoryId);

  return (
    <div className="flex flex-col gap-4">
      <GrammarSectionHeader
        title={category.category}
        backHref={backHref}
        backLabel="Back to Lexical Categories"
        meta={
          wordsInCategory.length > 0
            ? wordsInCategory.length === 1
              ? "1 word"
              : `${wordsInCategory.length} words`
            : undefined
        }
      />

      {wordsInCategory.length === 0 ? (
        <GrammarEmptyState
          icon={<InboxIcon className="size-5" />}
          title="No words in this category yet"
          description={`Assign "${category.category}" to a word's definition in the Lexicon and it will appear here.`}
        />
      ) : (
        <ListPanel>
          {wordsInCategory.map((word) => {
            const wordParams = new URLSearchParams(props.searchParams);
            wordParams.delete("category");
            wordParams.set("view", "lexicon");
            wordParams.set("word", word.id.toString());
            return (
              <RowLink
                key={word.id}
                href={`/lang/${props.conlang.id}/?${wordParams.toString()}`}
                label={word.text}
                labelClassName="font-unicode"
                hint={definitionSnippet(word, props.categoryId)}
                ariaLabel={`Open ${word.text} in the Lexicon`}
              />
            );
          })}
        </ListPanel>
      )}
    </div>
  );
}

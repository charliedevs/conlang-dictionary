import { ShapesIcon } from "lucide-react";
import {
  getLexicalCategoriesForConlang,
  getLexicalCategoryWordCounts,
} from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { AddLexicalCategory } from "./add-lexical-category";
import { LexicalCategoryView } from "./lexical-category-view";
import { LexicalCategorySuggestions } from "./lexical-category-suggestions";
import {
  GrammarSectionHeader,
  ListPanel,
  RowLink,
} from "./grammar-ui";

interface LexicalCategoriesProps {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
  isOwner: boolean;
}

const DESCRIPTION =
  "Lexical categories are the parts of speech — like noun, verb, or adjective — you assign to a word's definitions.";

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
  const existingNames = lexicalCategories.map((c) => c.category);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <GrammarSectionHeader
          title="Lexical Categories"
          backHref={backHref}
          backLabel="Back to Grammar"
          meta={
            lexicalCategories.length > 0
              ? `${lexicalCategories.length} total`
              : undefined
          }
          action={
            props.isOwner && lexicalCategories.length > 0 ? (
              <AddLexicalCategory
                conlangId={props.conlang.id}
                existing={existingNames}
                triggerLabel="Add"
                triggerVariant="outline"
              />
            ) : undefined
          }
        />
        <p className="pl-1 text-sm text-muted-foreground">{DESCRIPTION}</p>
      </div>

      {lexicalCategories.length === 0 ? (
        <EmptyState
          conlangId={props.conlang.id}
          existingNames={existingNames}
          isOwner={props.isOwner}
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
                labelClassName="capitalize"
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

/** Teaching empty state; for owners it doubles as guided onboarding. */
function EmptyState(props: {
  conlangId: number;
  existingNames: string[];
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShapesIcon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No lexical categories yet</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {props.isOwner
            ? "Add a few common parts of speech to get started, or create your own."
            : "The owner hasn't added any parts of speech to this conlang yet."}
        </p>
      </div>
      {props.isOwner && (
        <div className="mt-1 flex w-full max-w-sm flex-col gap-4 text-left">
          <LexicalCategorySuggestions
            conlangId={props.conlangId}
            existing={props.existingNames}
          />
          <div className="flex justify-center">
            <AddLexicalCategory
              conlangId={props.conlangId}
              existing={props.existingNames}
              triggerLabel="Add your own"
              triggerVariant="ghost"
            />
          </div>
        </div>
      )}
    </div>
  );
}

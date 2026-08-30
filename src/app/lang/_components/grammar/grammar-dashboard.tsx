import { getLexicalCategoriesForConlang } from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { ListPanel, RowLink } from "./grammar-ui";

interface GrammarDashboardProps {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}

/**
 * The Grammar landing: a short orientation plus an index of grammar sections.
 * Lexical Categories is live; other sections are honest roadmap rows, dimmed so
 * the UI never implies more finish than the product has.
 */
export async function GrammarDashboard(props: GrammarDashboardProps) {
  const lexicalCategories = await getLexicalCategoriesForConlang(
    props.conlang.id,
  );

  const params = new URLSearchParams(props.searchParams);
  params.set("grammar", "lexicalcategories");
  const lexicalCategoriesHref = `/lang/${props.conlang.id}/?${params.toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1 pl-1">
        <h2 className="text-lg font-semibold tracking-tight">Grammar</h2>
        <p className="text-sm text-muted-foreground">
          Organize the parts of speech and morphology of {props.conlang.name}.
        </p>
      </div>

      <ListPanel>
        <RowLink
          href={lexicalCategoriesHref}
          label="Lexical Categories"
          secondary="Parts of speech you assign to word definitions"
          meta={
            lexicalCategories.length === 1
              ? "1 category"
              : `${lexicalCategories.length} categories`
          }
          ariaLabel="Open Lexical Categories"
        />
      </ListPanel>

      <RoadmapRow
        label="Inflection"
        secondary="Generate regular declensions and conjugations, with exceptions"
      />
    </div>
  );
}

/** A disabled, honest preview of a planned grammar section. */
function RoadmapRow(props: { label: string; secondary: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {props.label}
          </span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Soon
          </span>
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground/80">
          {props.secondary}
        </span>
      </span>
    </div>
  );
}

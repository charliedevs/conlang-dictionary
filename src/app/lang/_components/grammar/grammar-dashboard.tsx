import Link from "next/link";
import { getLexicalCategoriesForConlang } from "~/server/queries";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface GrammarDashboardProps {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}

export async function GrammarDashboard(props: GrammarDashboardProps) {
  const lexicalCategories = await getLexicalCategoriesForConlang(
    props.conlang.id,
  );
  const params = new URLSearchParams(props.searchParams);
  params.set("grammar", "lexicalcategories");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link
        href={`/lang/${props.conlang.id}/?${params.toString()}`}
        className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        role="button"
        aria-label="View Lexical Categories"
        aria-describedby="lexical-categories-count"
      >
        <div className="text-sm font-medium text-muted-foreground">
          Lexical Categories
        </div>
        <div id="lexical-categories-count" className="text-2xl font-bold">
          {lexicalCategories.length}
        </div>
      </Link>
    </div>
  );
}

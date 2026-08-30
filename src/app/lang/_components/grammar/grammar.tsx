import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { GrammarDashboard } from "./grammar-dashboard";
import { GrammarNav } from "./grammar-nav";
import { GrammarSectionSkeleton } from "./grammar-skeletons";
import { LexicalCategories } from "./lexical-categories";

export function Grammar(props: {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}) {
  const selectedSection = props.searchParams.grammar;
  const isOwner = props.conlang.ownerId === auth().userId;

  return (
    <div id="grammar" className="flex flex-col">
      <div className="flex-1 items-start md:container md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(80vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <GrammarNav
            selectedSection={selectedSection}
            searchParams={props.searchParams}
            conlangId={props.conlang.id}
          />
        </aside>
        <article className="relative py-2 md:py-5">
          <Suspense fallback={<GrammarSectionSkeleton />}>
            {selectedSection === "lexicalcategories" ? (
              <LexicalCategories
                conlang={props.conlang}
                searchParams={props.searchParams}
                isOwner={isOwner}
              />
            ) : (
              <GrammarDashboard
                conlang={props.conlang}
                searchParams={props.searchParams}
              />
            )}
          </Suspense>
        </article>
      </div>
    </div>
  );
}

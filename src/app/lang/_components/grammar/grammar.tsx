import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { GrammarDashboard } from "./grammar-dashboard";
import { GrammarNav } from "./grammar-nav";
import { LexicalCategories } from "./lexical-categories";

export function Grammar(props: {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}) {
  const isConlangOwner = props.conlang.ownerId === auth().userId;
  const selectedSection = props.searchParams.grammar;

  return (
    <div id="grammar" className="flex flex-col">
      <div className="flex-1 items-start md:container md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside
          className={cn(
            "fixed top-14 z-30 -ml-2 hidden w-full shrink-0 md:sticky md:block",
            isConlangOwner ? "h-[calc(80vh-3.5rem)]" : "h-[calc(80vh-3.5rem)]",
          )}
        >
          <Suspense fallback={<div className="h-full">Loading...</div>}>
            <GrammarNav
              conlang={props.conlang}
              selectedSection={selectedSection}
              searchParams={props.searchParams}
            />
          </Suspense>
        </aside>
        <article className="relative py-2 md:py-5">
          {selectedSection ? (
            <Suspense
              fallback={<div className="py-5 text-center">Loading...</div>}
            >
              {selectedSection === "lexicalcategories" && (
                <LexicalCategories
                  conlang={props.conlang}
                  searchParams={props.searchParams}
                />
              )}
            </Suspense>
          ) : (
            <Suspense
              fallback={<div className="py-5 text-center">Loading...</div>}
            >
              <GrammarDashboard
                conlang={props.conlang}
                searchParams={props.searchParams}
              />
            </Suspense>
          )}
        </article>
      </div>
    </div>
  );
}

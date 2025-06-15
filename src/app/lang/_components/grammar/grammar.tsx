import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";
import { GrammarNav } from "./grammar-nav";
import { LexicalCategories } from "./lexical-categories";

export function Grammar(props: {
  conlang: Conlang;
  searchParams: LanguagePageSearchParams;
}) {
  const isConlangOwner = props.conlang.ownerId === auth().userId;
  const selectedSection = props.searchParams.section;

  return (
    <div id="grammar" className="flex flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside
          className={cn(
            "fixed top-14 z-30 -ml-2 hidden w-full shrink-0 md:sticky md:block",
            isConlangOwner ? "h-[calc(80vh-3.5rem)]" : "h-[calc(80vh-3.5rem)]", // why?
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
            <>
              <div className="not-sr-only h-full w-full md:sr-only">
                <Suspense
                  fallback={<div className="py-5 text-center">Loading...</div>}
                >
                  <GrammarNav
                    conlang={props.conlang}
                    selectedSection={selectedSection}
                    searchParams={props.searchParams}
                  />
                </Suspense>
              </div>
              <div className="sr-only md:not-sr-only">
                <div className="flex items-center justify-center rounded-md bg-accent p-8 text-muted-foreground">
                  <ArrowLeftIcon className="mr-2 size-5 opacity-50" />
                  Select a grammar section to view.
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}

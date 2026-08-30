import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface GrammarNavProps {
  conlangId: number;
  selectedSection?: string;
  searchParams?: LanguagePageSearchParams;
}

/** Live grammar sections, plus roadmap sections shown honestly as "Soon". */
const LIVE_SECTIONS = [{ id: "lexicalcategories", label: "Lexical Categories" }];
const ROADMAP_SECTIONS = [{ id: "inflection", label: "Inflection" }];

export function GrammarNav(props: GrammarNavProps) {
  const linkFor = (sectionId: string) => {
    const params = new URLSearchParams(props.searchParams);
    params.set("grammar", sectionId);
    return `/lang/${props.conlangId}/?${params.toString()}`;
  };

  return (
    <nav aria-label="Grammar sections" className="h-full md:border-r">
      <ScrollArea id="grammar-nav" className="h-full">
        <ul role="list" className="space-y-1 p-1 md:p-2">
          {LIVE_SECTIONS.map((section) => {
            const isActive = props.selectedSection === section.id;
            return (
              <li key={section.id}>
                <Link
                  href={linkFor(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block w-full truncate rounded-md border border-transparent px-3 py-2 text-center text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-start md:text-base",
                    isActive
                      ? "bg-accent font-semibold text-foreground md:text-primary"
                      : "text-foreground hover:bg-accent/50 md:text-muted-foreground md:hover:text-foreground",
                  )}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
          {ROADMAP_SECTIONS.map((section) => (
            <li key={section.id}>
              <span
                aria-disabled="true"
                title="Coming soon"
                className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-lg text-muted-foreground/60 md:justify-start md:text-base"
              >
                <span className="truncate">{section.label}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Soon
                </span>
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
}

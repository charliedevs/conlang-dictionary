import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface GrammarNavProps {
  conlang: Conlang;
  selectedSection?: string;
  searchParams?: LanguagePageSearchParams;
}

export async function GrammarNav(props: GrammarNavProps) {
  const sections = [
    { id: "lexicalcategories", label: "Lexical Categories" },
    // Add more sections here as needed
  ];

  return (
    <nav aria-label="Grammar sections" className="h-full md:border-r">
      <ScrollArea id="grammar-nav" className="h-full">
        <ul role="list" className="space-y-1 p-1 md:p-2">
          {sections.map((section) => {
            const params = new URLSearchParams(props.searchParams);
            params.set("grammar", section.id);
            return (
              <li key={section.id}>
                <Link
                  href={`/lang/${props.conlang.id}/?${params.toString()}`}
                  className={cn(
                    "inline-block w-full items-center overflow-x-hidden text-ellipsis rounded-md border border-transparent px-3 py-2 text-center text-lg transition-colors hover:bg-accent/50 hover:underline md:text-start md:text-base md:text-muted-foreground",
                    props.selectedSection === section.id
                      ? "bg-accent font-semibold md:text-primary"
                      : "",
                  )}
                  aria-current={
                    props.selectedSection === section.id ? "page" : undefined
                  }
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </nav>
  );
}

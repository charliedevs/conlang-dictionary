import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { type Conlang } from "~/types/conlang";
import { type LanguagePageSearchParams } from "../../[id]/page";

interface LexicalCategoriesProps {
  conlang: Conlang;
  searchParams?: LanguagePageSearchParams;
}

export async function LexicalCategories(props: LexicalCategoriesProps) {
  const params = new URLSearchParams(props.searchParams);
  params.delete("grammar");

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex items-center gap-1">
        <Link href={`/lang/${props.conlang.id}/?${params.toString()}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon className="size-4" />
            <div className="sr-only">Back</div>
          </Button>
        </Link>
        <h2 className="text-sm font-medium">Lexical Categories</h2>
      </div>
      <div className="rounded-md bg-accent p-8 text-muted-foreground">
        Lexical categories content coming soon...
      </div>
    </div>
  );
}

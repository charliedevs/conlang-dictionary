"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type Conlang } from "~/types/conlang";

export function LanguageSearch(props: { languages: Conlang[] }) {
  const [search, setSearch] = useState("");
  return (
    <div className="flex w-full flex-col gap-4 rounded-md border p-4">
      <Input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a language..."
        endAdornment={
          <SearchIcon className="size-4 text-muted-foreground/50" />
        }
        className="mx-3"
      />
      <ScrollArea className="flex max-h-[max(80vh,_700px)] flex-col gap-1">
        {props.languages
          .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
          .map((lang) => (
            <Link href={`/lang/${lang.id}`} key={lang.id}>
              <div className="flex items-center gap-2 rounded-md p-4 hover:bg-accent">
                <div className="min-w-6">{lang.emoji}</div>
                <div className="flex flex-col justify-between gap-1">
                  <div className="text-lg font-medium">{lang.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {lang.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </ScrollArea>
    </div>
  );
}

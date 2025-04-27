import { X } from "lucide-react";
import { SearchForm } from "~/app/_components/search-form";
import { ConlangTable } from "~/app/dashboard/_components/conlang-table";
import { Button } from "~/components/ui/button";
import { getPublicConlangs } from "~/server/queries";

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.toLowerCase() ?? "";
  const allConlangs = await getPublicConlangs();

  // Filter conlangs based on search query
  const filteredConlangs = allConlangs.filter(
    (conlang) =>
      conlang.name.toLowerCase().includes(query) ||
      conlang.description.toLowerCase().includes(query),
  );

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4 md:p-8">
      <h1 className="text-3xl font-medium">
        {query ? "Search Results" : "All Conlangs"}
      </h1>
      {query && (
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Showing results for &quot;{query}&quot;
          </p>
          <form action="/search">
            <Button variant="ghost" size="sm" className="h-8">
              <X className="mr-2 h-4 w-4" />
              Clear search
            </Button>
          </form>
        </div>
      )}
      <div className="w-full max-w-md">
        <SearchForm className="w-full" />
      </div>
      <div className="w-full">
        <ConlangTable
          conlangs={filteredConlangs}
          visibility={{
            isPublic: false,
            ownerId: false,
            createdAt: false,
            updatedAt: false,
            actions: false,
          }}
          className="bg-card/80"
        />
      </div>
    </div>
  );
}

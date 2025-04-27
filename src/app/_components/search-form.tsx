import { Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface SearchFormProps {
  variant?: "button" | "input";
  className?: string;
}

export function SearchForm({ variant = "input", className }: SearchFormProps) {
  async function search(formData: FormData) {
    "use server";
    const query = formData.get("q") as string;
    if (query) {
      redirect(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  if (variant === "button") {
    return (
      <Link href="/search">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search conlangs</span>
        </Button>
      </Link>
    );
  }

  return (
    <form action={search} className={className}>
      <div className="relative">
        <Input
          type="search"
          name="q"
          placeholder="Search conlangs..."
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </form>
  );
}

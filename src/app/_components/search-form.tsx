import { Search } from "lucide-react";
import { redirect } from "next/navigation";

import { Input } from "~/components/ui/input";

export function SearchForm() {
  async function search(formData: FormData) {
    "use server";
    const query = formData.get("q") as string;
    if (query) {
      redirect(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form action={search} className="relative w-full max-w-sm">
      <Input
        type="search"
        name="q"
        placeholder="Search conlangs..."
        className="w-full pl-10"
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </form>
  );
}

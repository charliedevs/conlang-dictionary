"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { Input } from "~/components/ui/input";

export function WordSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const q = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(q);

  // Sync local state with query param when it changes (e.g., browser nav)
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.slice(0, 20);
    setSearchInput(value);

    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    startTransition(() => {
      router.replace(`?${newParams.toString()}`);
    });
  }

  return (
    <div className="relative w-full md:max-w-64">
      <Input
        type="search"
        maxLength={20}
        placeholder="Search words..."
        value={searchInput}
        onChange={handleChange}
        aria-label="Search words"
        autoComplete="off"
        className="w-full"
      />
      {isPending && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b bg-transparent">
          <div className="animate-indeterminate h-full w-full bg-primary" />
        </div>
      )}
    </div>
  );
}

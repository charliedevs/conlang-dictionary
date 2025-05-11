"use client";
import { Volume2Icon } from "lucide-react";
import { useIPAReaderHealth } from "~/hooks/data/useIPAReaderHealth";

interface IPAReaderLinkProps {
  ipa: string;
}

export function IPAReaderLink({ ipa }: IPAReaderLinkProps) {
  const isUp = useIPAReaderHealth();

  if (!isUp) return null;
  return (
    <a
      href={`https://ipa-reader.com/?text=${encodeURIComponent(ipa)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2 text-muted-foreground hover:text-primary/80"
      style={{
        verticalAlign: "middle",
        display: "inline-flex",
        alignItems: "center",
      }}
      aria-label="Open in IPA Reader"
    >
      <Volume2Icon className="h-4 w-4" />
    </a>
  );
}

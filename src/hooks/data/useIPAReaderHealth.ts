import useSWR from "swr";

export function useIPAReaderHealth(): boolean | null {
  const { data, error } = useSWR("/api/ipa-reader-health", (url) =>
    fetch(url).then((r) => r.json()),
  );
  if (error) return false;
  return data?.isUp ?? null;
}

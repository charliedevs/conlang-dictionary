import useSWR from "swr";

interface IPAReaderHealthResponse {
  isUp: boolean;
}

export function useIPAReaderHealth(): boolean | null {
  const { data, error } = useSWR<IPAReaderHealthResponse, Error>(
    "/api/ipa-reader-health",
    (url: string) => fetch(url).then((r) => r.json()),
  );
  if (error) return false;
  return data?.isUp ?? null;
}

/**
 * Fetches a conlang export from the API and triggers a browser download.
 * Browser-glue (Blob + temporary `<a download>` link) — not unit tested;
 * verified manually in the browser per the project's UI testing convention.
 */
export async function downloadConlangExport(
  conlangId: number,
  format: "json" | "markdown",
) {
  const res = await fetch(
    `/api/conlang/export?conlangId=${conlangId}&format=${format}`,
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: unknown;
    } | null;
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : `Export failed (${res.status})`,
    );
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const extension = format === "markdown" ? "md" : "json";
  const filename =
    /filename="([^"]+)"/.exec(disposition)?.[1] ?? `conlang.${extension}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

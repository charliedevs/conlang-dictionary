import { conlangExportFilename } from "~/lib/conlang-export/filename";
import { serializeConlangExport } from "~/lib/conlang-export/to-export-json";
import { conlangExportToMarkdown } from "~/lib/conlang-export/to-markdown";
import { getConlangExportData } from "~/server/queries";
import { getConlangExportSchema } from "./types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const queryParams = {
    conlangId: Number(url.searchParams.get("conlangId")),
    format: url.searchParams.get("format") ?? undefined,
  };
  const parsedQuery = getConlangExportSchema.safeParse(queryParams);
  if (!parsedQuery.success) {
    return new Response(
      JSON.stringify({ error: parsedQuery.error.flatten() }),
      { status: 400 },
    );
  }

  try {
    const data = await getConlangExportData(parsedQuery.data.conlangId);
    const exportData = serializeConlangExport(data);

    if (parsedQuery.data.format === "markdown") {
      const filename = conlangExportFilename(data.conlang.name, "md");
      return new Response(conlangExportToMarkdown(exportData), {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const filename = conlangExportFilename(data.conlang.name, "json");
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Conlang not found") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
      });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
      });
    }
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

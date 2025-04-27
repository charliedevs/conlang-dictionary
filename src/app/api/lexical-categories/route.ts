import { getLexicalCategoriesForConlang } from "~/server/queries";
import { getLexicalCategoriesSchema } from "./types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = {
      conlangId: Number(url.searchParams.get("conlangId")),
    };
    const parsedQuery = getLexicalCategoriesSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return new Response(
        JSON.stringify({ error: parsedQuery.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const lexicalCategories = await getLexicalCategoriesForConlang(
      parsedQuery.data.conlangId,
    );
    return new Response(JSON.stringify(lexicalCategories));
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

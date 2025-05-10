import { getCustomFieldKeysForConlang } from "~/server/queries";
import { getCustomFieldKeysSchema } from "./types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = {
      conlangId: Number(url.searchParams.get("conlangId")),
    };
    const parsedQuery = getCustomFieldKeysSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return new Response(
        JSON.stringify({ error: parsedQuery.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const keys = await getCustomFieldKeysForConlang(parsedQuery.data.conlangId);
    return new Response(JSON.stringify(keys));
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

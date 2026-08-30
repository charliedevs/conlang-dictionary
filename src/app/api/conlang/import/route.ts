import { createApiErrorResponse } from "~/app/api/_utils/api-error-handler";
import { importConlang } from "~/server/mutations";
import { importConlangSchema } from "./types";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsedBody = importConlangSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: parsedBody.error.flatten() }),
        { status: 400 },
      );
    }

    const conlang = await importConlang(parsedBody.data);
    return new Response(JSON.stringify({ conlang }), { status: 201 });
  } catch (error: unknown) {
    const apiErrorResponse = createApiErrorResponse(error);
    return new Response(
      JSON.stringify({
        error: apiErrorResponse.error,
        code: apiErrorResponse.code,
      }),
      { status: apiErrorResponse.status },
    );
  }
}

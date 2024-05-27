import { z } from "zod";
import { createWord } from "~/server/queries";
import { createApiErrorResponse } from "../_utils/api-error-handler";

const createWordSchema = z.object({
  conlangId: z.number(),
  text: z.string().min(1, "Word text required."),
  pronunciation: z.string().optional(),
  gloss: z.string().optional(),
  definition: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as z.infer<typeof createWordSchema>;
    const parsedBody = createWordSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: parsedBody.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const word = await createWord(
      parsedBody.data.conlangId,
      parsedBody.data.text,
      parsedBody.data.pronunciation,
      parsedBody.data.gloss,
      parsedBody.data.definition,
    );
    return new Response(JSON.stringify({ word }), {
      status: 201,
    });
  } catch (error: unknown) {
    const apiErrorResponse = createApiErrorResponse(error);
    return new Response(
      JSON.stringify({
        error: apiErrorResponse.error,
        code: apiErrorResponse.code,
      }),
      {
        status: apiErrorResponse.status,
      },
    );
  }
}

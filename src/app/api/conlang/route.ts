import { z } from "zod";

import { createConlang } from "~/server/queries";

const createConlangSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as z.infer<typeof createConlangSchema>;
    const parsedBody = createConlangSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: parsedBody.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const conlang = await createConlang(
      parsedBody.data.name,
      parsedBody.data.isPublic,
    );
    return new Response(JSON.stringify({ conlang }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

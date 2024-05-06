import { z } from "zod";

import { createConlang, updateConlang } from "~/server/queries";

const createConlangSchema = z.object({
  name: z.string().min(1, "Conlang name required."),
  emoji: z.string().emoji("Must be a valid emoji.").optional(),
  description: z.string().optional(),
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
      parsedBody.data.description,
      parsedBody.data.emoji,
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

const updateConlangSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Conlang name required."),
  emoji: z.string().emoji("Must be a valid emoji.").optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as z.infer<typeof updateConlangSchema>;
    const parsedBody = updateConlangSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({ error: parsedBody.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const conlang = await updateConlang(
      parsedBody.data.id,
      parsedBody.data.name,
      parsedBody.data.description,
      parsedBody.data.emoji,
      parsedBody.data.isPublic,
    );
    return new Response(JSON.stringify({ conlang }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

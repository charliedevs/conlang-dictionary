import { getAllWordTags, getWordTagsForUser } from "~/server/queries";
import { getTagsSchema } from "./types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = {
      tagType: url.searchParams.get("tagType"),
    };
    const parsedQuery = getTagsSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return new Response(
        JSON.stringify({ error: parsedQuery.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    const tagType = parsedQuery.data.tagType;
    const isForUser = parsedQuery.data.isForUser;
    if (tagType === "word") {
      if (isForUser) {
        const tags = await getWordTagsForUser();
        return new Response(JSON.stringify(tags));
      }
      const tags = await getAllWordTags();
      return new Response(JSON.stringify(tags));
    } else {
      return new Response(
        "Not implemented. Provide a query param for tagType=word",
        {
          status: 501,
        },
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

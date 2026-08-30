import { clerkClient } from "@clerk/nextjs/server";

import { getUsersSchema } from "./types";

export async function GET(req: Request) {
  try {
    // Lookup is by user id only — see ./types.ts for why.
    const url = new URL(req.url);
    const parsedQuery = getUsersSchema.safeParse({
      userId: url.searchParams.getAll("userId"),
    });
    if (!parsedQuery.success) {
      return new Response(
        JSON.stringify({ error: parsedQuery.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    // Never call Clerk with an empty filter: getUserList would happily return
    // an arbitrary page of the entire instance.
    if (parsedQuery.data.userId.length === 0) {
      return new Response(JSON.stringify([]));
    }

    // Fetch user list from Clerk
    const userList = await (
      await clerkClient()
    ).users.getUserList(parsedQuery.data);
    const filteredUserList = userList.data.map((user) => ({
      id: user.id,
      name: user.fullName,
      imageUrl: user.imageUrl,
    }));

    return new Response(JSON.stringify(filteredUserList));
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

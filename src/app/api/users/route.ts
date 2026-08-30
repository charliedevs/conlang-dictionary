import { clerkClient } from "@clerk/nextjs/server";

import { getUsersSchema } from "./types";

export async function GET(req: Request) {
  try {
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

    // An empty filter would make getUserList return an arbitrary page of users.
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

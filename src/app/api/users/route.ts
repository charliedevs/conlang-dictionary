import { clerkClient } from "@clerk/nextjs/server";

import { getUsersSchema } from "./types";

export async function GET(req: Request) {
  try {
    // Parse query params from the request
    const url = new URL(req.url);
    const queryParams = {
      userId: url.searchParams.getAll("userId"),
      username: url.searchParams.getAll("username"),
      emailAddress: url.searchParams.getAll("emailAddress"),
    };
    const parsedQuery = getUsersSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return new Response(
        JSON.stringify({ error: parsedQuery.error.flatten() }),
        {
          status: 400,
        },
      );
    }

    // Fetch user list from Clerk
    const userList = await clerkClient.users.getUserList(parsedQuery.data);
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

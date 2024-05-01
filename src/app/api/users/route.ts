import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

export const getUsersSchema = z.object({
  userId: z.array(z.string()).optional(),
  username: z.array(z.string()).optional(),
  emailAddress: z.array(z.string()).optional(),
});

export type User = {
  id: string;
  name: string;
  imageUrl: string;
};

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

import { type User } from "@clerk/nextjs/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
    externalUsername:
      user.externalAccounts.find((acc) => acc.username)?.username ?? undefined,
  };
};

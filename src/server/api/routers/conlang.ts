import { clerkClient } from "@clerk/nextjs";
import type { Conlang } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

// Attach username and profile img url to conlangs
const addUserDataToConlangs = async (conlangs: Conlang[]) => {
  const userId = conlangs.map((conlang) => conlang.ownerId);

  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
    })
  ).map(filterUserForClient);

  return conlangs.map((conlang) => {
    const owner = users.find((user) => user.id === conlang.ownerId);

    if (!owner) {
      console.error("OWNER NOT FOUND", conlang);
      // throw new TRPCError({
      //   code: "INTERNAL_SERVER_ERROR",
      //   message: `Owner for conlang not found. CONLANG ID: ${conlang.id}, USER ID: ${conlang.ownerId}`,
      // });
    }
    // if (!owner.username) {
    //   // Check for external username
    //   if (!owner.externalUsername) {
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: `Owner has no username associated with account: ${owner.id}`,
    //     });
    //   }
    //   owner.username = owner.externalUsername;
    // }

    return {
      conlang,
      owner: {
        ...owner,
        username: owner?.username ?? "(unknown user)",
      },
    };
  });
};

export const conlangRouter = createTRPCRouter({
  // Get recently-updated conlangs
  getRecent: publicProcedure.query(async ({ ctx }) => {
    const conlangs = await ctx.db.conlang.findMany({
      // where: { isPublic: true },
      take: 50,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToConlangs(conlangs);
  }),

  // Get a user's conlangs
  getByOwnerId: publicProcedure
    .input(z.object({ ownerId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.conlang
        .findMany({
          where: {
            ownerId: input.ownerId,
          },
          take: 50,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToConlangs),
    ),

  // Create a new conlang
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        emoji: z.string().emoji("Must be a valid emoji").max(1).optional(),
        description: z.string().min(5).max(500),
        isPublic: z.boolean().default(false),
        ownerId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.conlang.create({
        data: {
          name: input.name,
          emoji: input.emoji,
          description: input.description,
          isPublic: input.isPublic,
          ownerId: input.ownerId,
        },
      });
    }),
});

import { auth } from "@clerk/nextjs/server";
import { getConlangById } from "~/server/queries";

export async function isConlangOwner(conlangId: number) {
  const conlang = await getConlangById(conlangId);
  return conlang.ownerId === auth().userId;
}

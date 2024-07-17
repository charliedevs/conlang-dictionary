import { type getMyConlangs } from "~/server/queries";

type Conlangs = Awaited<ReturnType<typeof getMyConlangs>>;
export type Conlang = Conlangs[number];

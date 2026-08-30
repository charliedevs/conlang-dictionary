import { z } from "zod";
import { conlangExportSchema } from "~/types/conlang-export";

export const importConlangSchema = z.object({
  conlangName: z.string().min(1, "Conlang name required."),
  data: conlangExportSchema,
});

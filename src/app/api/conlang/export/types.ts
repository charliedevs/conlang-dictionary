import { z } from "zod";

export const getConlangExportSchema = z.object({
  conlangId: z.number(),
  format: z.enum(["json"]).default("json"),
});

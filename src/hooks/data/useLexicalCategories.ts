import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLexicalCategory,
  type CreateLexicalCategory,
} from "~/app/lang_old/[id]/_actions/word";
import { type LexicalCategory } from "~/types/word";

function getLexicalCategories(conlangId: number) {
  return fetch(`/api/lexical-categories?conlangId=${conlangId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json()) as Promise<LexicalCategory[]>;
}

export function useLexicalCategories(conlangId: number) {
  const lexicalCategories = useQuery<LexicalCategory[]>({
    queryKey: ["lexicalCategories", conlangId],
    queryFn: () => getLexicalCategories(conlangId),
  });

  const queryClient = useQueryClient();
  const addLexicalCategory = useMutation({
    mutationFn: (data: CreateLexicalCategory) => createLexicalCategory(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lexicalCategories"] });
    },
  });

  return { lexicalCategories, addLexicalCategory };
}

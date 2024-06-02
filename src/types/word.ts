export type Word = {
  id: number;
  conlangId: number;
  text: string;
  pronunciation: string | null;
  gloss: string | null;
  definition: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

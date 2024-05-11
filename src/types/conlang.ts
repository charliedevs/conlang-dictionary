export type Conlang = {
  id: number;
  name: string;
  description: string | null;
  emoji: string | null;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export interface OwnedConlang {
  id: number;
  ownerId: string | null;
  ownerUserId: string | null;
}

export interface OwnerRecord {
  id: string;
  clerkUserId: string | null;
  displayName: string | null;
  username: string | null;
  imageUrl: string | null;
}

export interface ConlangOwner {
  name: string | null;
  imageUrl: string | null;
}

// Only display fields are returned; owner ids and email never reach the client.
export function mapOwnersToConlangs(
  conlangs: OwnedConlang[],
  owners: OwnerRecord[],
): Record<number, ConlangOwner> {
  const byLocalId = new Map(owners.map((o) => [o.id, o]));
  const byClerkId = new Map(
    owners.flatMap((o) => (o.clerkUserId ? [[o.clerkUserId, o] as const] : [])),
  );

  const result: Record<number, ConlangOwner> = {};
  for (const conlang of conlangs) {
    const owner =
      (conlang.ownerUserId ? byLocalId.get(conlang.ownerUserId) : undefined) ??
      (conlang.ownerId ? byClerkId.get(conlang.ownerId) : undefined);
    if (!owner) continue;
    result[conlang.id] = {
      name: owner.displayName ?? owner.username ?? null,
      imageUrl: owner.imageUrl,
    };
  }
  return result;
}

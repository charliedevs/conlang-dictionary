import { SignedIn, SignedOut } from "@clerk/nextjs";
import { db } from "~/server/db";

// Force dynamic so client always sees latest data
export const dynamic = "force-dynamic";

async function Images() {
  const images = await db.query.images.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  });
  return (
    <div className="flex flex-wrap gap-4">
      {images.map((image, index) => (
        <div key={image.id + index} className="flex w-48 flex-col">
          <img src={image.url} alt={image.name} />
          <div>{image.name}</div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <main className="p-4">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please sign in above to view the gallery.
        </div>
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </main>
  );
}

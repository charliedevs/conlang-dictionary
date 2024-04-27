import { db } from "~/server/db";

// Force dynamic so client always sees latest data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const images = await db.query.images.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  });
  return (
    <main className="p-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={image.id + index} className="flex w-48 flex-col">
            <img src={image.url} alt={image.name} />
            <div>{image.name}</div>
          </div>
        ))}
      </div>
      Tutorial in progress
    </main>
  );
}

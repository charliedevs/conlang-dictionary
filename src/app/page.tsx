import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import { getMyImages } from "~/server/queries";

// Force dynamic so client always sees latest data
export const dynamic = "force-dynamic";

async function Images() {
  const images = await getMyImages();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {images.map((image) => (
        <div key={image.id} className="flex w-48 flex-col">
          <Image
            src={image.url}
            alt={image.name}
            width={200}
            height={200}
            style={{ objectFit: "cover" }}
          />
          <div className="text-xs">{image.name}</div>
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

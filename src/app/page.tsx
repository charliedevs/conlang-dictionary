import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { getMyImages } from "~/server/queries";

// Force dynamic so client always sees latest data
export const dynamic = "force-dynamic";

async function Images() {
  const images = await getMyImages();

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {images.map((image) => (
        <Link href={`/image/${image.id}`} key={image.id} title="View image">
          <div className="flex h-48 w-44 flex-col gap-1 rounded-sm p-1 transition-all ease-in hover:bg-slate-50/10 hover:outline hover:outline-1 hover:outline-slate-200">
            <div className="flex h-36 items-center overflow-hidden">
              <Image
                src={image.url}
                alt={image.name}
                width={200}
                height={180}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="truncate text-xs">{image.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <>
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please sign in above to view the gallery.
        </div>
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </>
  );
}

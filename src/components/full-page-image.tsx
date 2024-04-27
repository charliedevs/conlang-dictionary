/* eslint-disable @next/next/no-img-element */
import { getImageById } from "~/server/queries";

// This page is using next parallel routes. Read more about it here:
// https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
export default async function FullPageImageView(props: { imageId: number }) {
  const image = await getImageById(props.imageId);

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-shrink items-center justify-center">
        <img
          src={image.url}
          alt={image.name}
          className="min-w-0 flex-shrink object-contain"
        />
      </div>

      <div className="flex w-48 flex-shrink-0 flex-col border-l">
        <div className="text-xl font-bold">{image.name}</div>
      </div>
    </div>
  );
}

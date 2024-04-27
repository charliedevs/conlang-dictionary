/* eslint-disable @next/next/no-img-element */
import { getImageById } from "~/server/queries";

// This page is using next parallel routes. Read more about it here:
// https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
export default async function ImageModal({
  params: { id: imageId },
}: {
  params: { id: string };
}) {
  const idAsNumber = Number(imageId);
  if (Number.isNaN(idAsNumber)) throw new Error("Invalid image id");

  const image = await getImageById(idAsNumber);
  return (
    <div>
      <img src={image.url} alt={image.name} className="w-auto" />
    </div>
  );
}

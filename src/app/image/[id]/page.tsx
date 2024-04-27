import FullPageImageView from "~/components/full-page-image";

// This page is using next parallel routes. Read more about it here:
// https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
export default function ImageModal({
  params: { id: imageId },
}: {
  params: { id: string };
}) {
  const idAsNumber = Number(imageId);
  if (Number.isNaN(idAsNumber)) throw new Error("Invalid image id");

  return <FullPageImageView imageId={idAsNumber} />;
}

/* eslint-disable @next/next/no-img-element */
import { getImageById } from "~/server/queries";

// This page is using next parallel routes. Read more about it here:
// https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
export default async function FullPageImageView(props: { imageId: number }) {
  const image = await getImageById(props.imageId);
  return <img src={image.url} alt={image.name} className="w-auto" />;
}

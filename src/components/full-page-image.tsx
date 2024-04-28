/* eslint-disable @next/next/no-img-element */
import { clerkClient } from "@clerk/nextjs/server";
import { getImageById } from "~/server/queries";

// This page is using next parallel routes. Read more about it here:
// https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
export default async function FullPageImageView(props: { imageId: number }) {
  const image = await getImageById(props.imageId);

  const uploaderInfo = await clerkClient.users.getUser(image.userId);

  return (
    <div className="flex h-full w-full">
      <div className="flex w-9/12 flex-shrink items-center justify-center">
        <img
          src={image.url}
          alt={image.name}
          className="min-w-0 flex-shrink object-contain"
        />
      </div>

      <div className="flex w-3/12 flex-shrink flex-col border-l">
        <div className="overflow-auto break-words border-b p-2 text-center text-lg">
          {image.name}
        </div>
        <div className="flex flex-col p-2">
          <span>Uploaded By:</span>
          <span>{uploaderInfo.fullName}</span>
        </div>
        <div className="flex flex-col p-2">
          <span>Created On:</span>
          <span>{new Date(image.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { deleteImage, getImageById } from "~/server/queries";
import { Button } from "./ui/button";

export default async function FullPageImageView(props: { imageId: number }) {
  const image = await getImageById(props.imageId);
  const uploaderInfo = await clerkClient.users.getUser(image.userId);

  return (
    <div className="flex h-full w-full">
      <div
        id="fullImage"
        className="flex w-9/12 flex-shrink items-center justify-center md:m-2"
      >
        <img
          src={image.url}
          alt={image.name}
          className="min-w-0 flex-shrink object-contain"
        />
      </div>

      <div
        id="imageDetails"
        className="flex w-3/12 flex-shrink flex-col justify-center border-l"
      >
        <div className="overflow-auto break-words border-b border-t p-2 text-center text-lg">
          {image.name}
        </div>
        <div className="flex flex-col gap-1 p-3 md:flex-row">
          <div className="flex-shrink">Owner:</div>
          <div>{uploaderInfo.fullName}</div>
        </div>
        <div className="flex flex-col gap-1 p-3 md:flex-row">
          <div>Uploaded:</div>
          <div>{new Date(image.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="px-3 py-5">
          <form
            action={async () => {
              "use server";
              await deleteImage(image.id);
              redirect("/");
            }}
          >
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

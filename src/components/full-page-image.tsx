/* eslint-disable @next/next/no-img-element */
import { clerkClient } from "@clerk/nextjs/server";

import { deleteImage, getImageById } from "~/server/queries";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

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
        <div className="p-2">
          <div>Uploaded By:</div>
          <div>{uploaderInfo.fullName}</div>
        </div>
        <div className="p-2">
          <div>Created On:</div>
          <div>{new Date(image.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="p-2">
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

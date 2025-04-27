"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { removeWordSection } from "../../_actions/word";

interface DeleteSectionProps {
  sectionId: number;
  afterDelete?: () => void;
}

export function DeleteSection({ sectionId, afterDelete }: DeleteSectionProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeWordSection(sectionId);
      setOpen(false);
      if (afterDelete) {
        afterDelete();
      }
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete section. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-6 p-1 text-red-700 transition-all hover:bg-red-600/20 hover:text-red-800 md:opacity-0 md:group-hover/section:opacity-100"
          title="Delete Section"
        >
          <Trash2Icon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Section?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this section? This will also delete
            all definitions within it.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

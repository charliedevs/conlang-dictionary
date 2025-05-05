import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { type LexicalSection } from "~/types/word";
import { removeLexicalSection } from "../../../_actions/word";

export function DeleteSection({
  section,
  wordText,
  afterDelete,
}: {
  section: LexicalSection;
  wordText: string;
  afterDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeLexicalSection(section.id);
      setOpen(false);
      if (afterDelete) afterDelete();
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
          id="delete-section-button"
          variant="ghost"
          size="sm"
          className="size-6 p-1 text-muted-foreground transition-all hover:bg-red-600/20 hover:!text-red-800 group-hover/section:text-red-700"
        >
          <span className="sr-only">Delete section</span>
          <Trash2Icon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {section.sectionType} section on{" "}
            <span className="font-bold text-primary/90">{wordText}</span>?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this section?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

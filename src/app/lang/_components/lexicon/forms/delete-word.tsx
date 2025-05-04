import { Trash2Icon } from "lucide-react";
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
import { type Word } from "~/types/word";
import { removeWord } from "../../../_actions/word";

export function DeleteWord(props: { word: Word; afterDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeWord(props.word.id);
      setOpen(false);
      props.afterDelete();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete word. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id="delete-word-button"
          variant="ghost"
          size="sm"
          className="size-6 p-1 text-red-700 transition-all hover:bg-red-600/20 hover:text-red-800"
        >
          <Trash2Icon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete Word{" "}
            <span className="font-bold text-primary/90">{props.word.text}</span>
            ?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this word?
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

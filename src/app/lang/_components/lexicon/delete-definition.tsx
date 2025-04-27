import parseHtml from "html-react-parser";
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
import { type Definition } from "~/types/word";
import { removeDefinition } from "../../_actions/word";

export function DeleteDefinition(props: {
  definition: Definition;
  afterDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeDefinition(props.definition.id);
      setOpen(false);
      props.afterDelete();
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete definition. Please try again.");
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
          className="size-6 p-1 text-red-700 transition-all hover:bg-red-600/20 hover:text-red-800 md:opacity-0 md:group-hover/definition:opacity-100"
          title="Delete Definition"
        >
          <Trash2Icon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Definition?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this definition?
            <p className="pt-4 italic">{parseHtml(props.definition.text)}</p>
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

"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { NewWordForm } from "./new-word-form";
import { useState } from "react";

export function AddWordButton(props: { conlangId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Word</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Word</DialogTitle>
          {/* <DialogDescription></DialogDescription> */}
        </DialogHeader>
        <NewWordForm
          conlangId={props.conlangId}
          afterSubmit={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

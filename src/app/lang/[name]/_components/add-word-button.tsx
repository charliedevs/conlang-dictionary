"use client";

import { useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { NewWordForm } from "./new-word-form";

export function AddWordButton(props: { conlangId: number }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
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
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add Word</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Word</DrawerTitle>
          {/* <DrawerDescription></DrawerDescription> */}
        </DrawerHeader>
        <NewWordForm
          conlangId={props.conlangId}
          afterSubmit={() => setOpen(false)}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

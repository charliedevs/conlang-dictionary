"use client";

import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { NewWordForm } from "./new-word-form";
import { PlusCircle } from "~/components/icons/plus-circle";

export function AddWordButton(props: { conlangId: number }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-1 size-5 text-inherit" />
            Add Word
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Word</DialogTitle>
            <DialogDescription>
              You can add more details later.
            </DialogDescription>
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
        <Button>
          <PlusCircle className="mr-1 size-5 text-inherit" />
          Add Word
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Word</DrawerTitle>
          <DrawerDescription>You can add more details later.</DrawerDescription>
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

"use client";

import { useEffect, useState, type ReactNode } from "react";
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

export function DialogDrawer(props: {
  trigger?: ReactNode;
  title: string;
  open?: boolean;
  description?: string;
  onClose?: () => void;
  content: ReactNode;
}) {
  const [open, setOpen] = useState(props.open ?? false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setOpen(props.open ?? false);
  }, [props.open]);

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open && props.onClose) {
            props.onClose();
          }
        }}
      >
        {Boolean(props.trigger) && (
          <DialogTrigger asChild>{props.trigger}</DialogTrigger>
        )}
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            {props.description && (
              <DialogDescription>{props.description}</DialogDescription>
            )}
          </DialogHeader>
          {props.content}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open && props.onClose) {
          props.onClose();
        }
      }}
    >
      {Boolean(props.trigger) && (
        <DrawerTrigger asChild>{props.trigger}</DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description && (
            <DrawerDescription>{props.description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="m-4 flex flex-col gap-8">{props.content}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

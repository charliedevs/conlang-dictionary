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
import { cn } from "~/lib/utils";

export function DialogDrawer(props: {
  trigger?: ReactNode;
  title: string;
  open?: boolean;
  description?: string;
  onClose?: () => void;
  content: ReactNode;
  /** Widen the desktop dialog beyond the default max-w-lg, e.g. for forms with richer content. */
  contentClassName?: string;
  /**
   * Skip the drawer's own Cancel button — use when `content` already renders
   * its own submit/cancel actions, so mobile doesn't show two ways to cancel.
   */
  hideDefaultFooter?: boolean;
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
        <DialogContent className={cn(props.contentClassName)}>
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
        {!props.hideDefaultFooter && (
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

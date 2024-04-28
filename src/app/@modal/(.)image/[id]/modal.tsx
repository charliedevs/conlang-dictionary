"use client";

import { type ElementRef, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "~/components/ui/button";

function CloseSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<"dialog">>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="h-screen w-screen bg-slate-950/90 text-slate-100"
      onClose={onDismiss}
    >
      {children}
      <div className="absolute right-2 top-2 flex">
        <Button
          variant="ghost"
          className="flex items-center justify-between gap-2"
          onClick={onDismiss}
        >
          <CloseSVG />
          <span className="text-md">Close</span>
        </Button>
      </div>
    </dialog>,
    document.getElementById("modal-root")!,
  );
}

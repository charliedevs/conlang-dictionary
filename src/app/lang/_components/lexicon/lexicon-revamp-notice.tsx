"use client";

import { MessageCircleWarningIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

interface LexiconRevampNoticeProps {
  conlangId: number;
}

export function LexiconRevampNotice({ conlangId }: LexiconRevampNoticeProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(
      `lexiconRevampDismissed-${conlangId}`,
    );
    setShow(!dismissed);
  }, [conlangId]);

  const handleDismiss = () => {
    localStorage.setItem(`lexiconRevampDismissed-${conlangId}`, "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
      <div className="flex items-center gap-2">
        <MessageCircleWarningIcon className="-mt-0.5 self-start" />
        <span>
          <strong>Notice:</strong> Word sections were recently updated. Your
          definitions may look different—edit words to adjust formatting if
          needed.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-4 border-yellow-300 bg-yellow-100 text-yellow-900 hover:bg-yellow-200 dark:border-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700"
        onClick={handleDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}

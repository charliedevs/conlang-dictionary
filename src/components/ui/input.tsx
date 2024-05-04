import * as React from "react";

import { cn } from "~/lib/utils";
import { Button } from "./button";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  buttonContents?: React.ReactNode;
  onButtonClick?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, buttonContents, onButtonClick, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {buttonContents && (
          <Button
            type="button"
            variant="ghost"
            className="absolute right-1 top-0 h-full w-8 p-1 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={onButtonClick}
          >
            {buttonContents}
          </Button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };

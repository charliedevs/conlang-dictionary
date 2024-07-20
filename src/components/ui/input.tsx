import * as React from "react";

import { cn } from "~/lib/utils";
import { Button } from "./button";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  endAdornment?: React.ReactNode;
  buttonContents?: React.ReactNode;
  onButtonClick?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, endAdornment, buttonContents, onButtonClick, ...props },
    ref,
  ) => {
    const hasEndContent = Boolean(endAdornment) || Boolean(buttonContents);
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
        {hasEndContent && (
          <div className="absolute right-2 top-0 flex h-full items-center justify-center gap-1">
            {endAdornment && (
              <div className="w-8 p-1 text-muted-foreground">
                {endAdornment}
              </div>
            )}
            {buttonContents && (
              <Button
                type="button"
                variant="ghost"
                className="w-8 p-1 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={onButtonClick}
              >
                {buttonContents}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };

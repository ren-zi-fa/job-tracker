import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import type * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-none border-2 border-input bg-card px-3 py-1 text-xs shadow-brutal-sm transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-brutal focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

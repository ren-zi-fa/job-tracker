import { cn } from "cn";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-2 border-input bg-card px-3 py-2 text-xs shadow-brutal-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-brutal focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

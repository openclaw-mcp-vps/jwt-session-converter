import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-20 w-full rounded-md border border-[#344359] bg-[#0d1623] px-3 py-2 text-sm text-[#e6edf3] ring-offset-[#0d1117] placeholder:text-[#6f8092] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cc9f0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

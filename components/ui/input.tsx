import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-[#344359] bg-[#0d1623] px-3 py-2 text-sm text-[#e6edf3] ring-offset-[#0d1117] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6f8092] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4cc9f0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#4cc9f0] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1f6feb] text-[#dceeff]",
        critical: "border-[#f85149]/50 bg-[#3b1f23] text-[#ffb9b4]",
        high: "border-[#d29922]/50 bg-[#3a2c14] text-[#ffd88a]",
        medium: "border-[#1f6feb]/50 bg-[#162741] text-[#c5ddff]",
        low: "border-[#2ea043]/50 bg-[#1a3520] text-[#a7e7b3]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

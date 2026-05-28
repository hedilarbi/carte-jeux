import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none ring-0 focus:border-primary/35 focus:shadow-[0_0_0_4px_rgba(1,45,105,0.08)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

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
        "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 focus:border-sky-400/40 focus:shadow-[0_0_0_4px_rgba(103,208,255,0.1)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

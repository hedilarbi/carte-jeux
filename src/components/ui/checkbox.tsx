import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 rounded border border-white/15 bg-slate-950/60 text-sky-400 focus:ring-2 focus:ring-sky-400/30",
        className,
      )}
      {...props}
    />
  );
}

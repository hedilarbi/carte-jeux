import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-slate-400 focus:border-primary/35 focus:shadow-[0_0_0_4px_rgba(1,45,105,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

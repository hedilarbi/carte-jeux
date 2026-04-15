import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-400 text-slate-950 hover:bg-sky-300 disabled:bg-slate-700 disabled:text-slate-400",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-500",
  outline:
    "border border-white/15 bg-transparent text-slate-100 hover:bg-white/6 disabled:border-white/8 disabled:text-slate-500",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/6 hover:text-white disabled:text-slate-500",
  danger:
    "bg-rose-500/90 text-white hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

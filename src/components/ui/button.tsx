import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[#064FB1] disabled:bg-slate-200 disabled:text-slate-400",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
  outline:
    "border border-border bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 disabled:bg-slate-50 disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 disabled:text-slate-400",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400",
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
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

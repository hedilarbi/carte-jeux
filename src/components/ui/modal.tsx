import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  children: ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  size?: "default" | "wide";
  title: string;
}

export function Modal({
  children,
  description,
  isOpen,
  onClose,
  size = "default",
  title,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Fermer la fenêtre"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-modal="true"
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_28px_90px_rgba(15,35,68,0.2)]",
          size === "wide" ? "max-w-5xl" : "max-w-2xl",
        )}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Fermer"
            className="shrink-0 px-3"
            onClick={onClose}
            variant="ghost"
          >
            ×
          </Button>
        </header>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
      </section>
    </div>
  );
}

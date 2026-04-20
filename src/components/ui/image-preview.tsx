import { cn } from "@/lib/utils/cn";

interface ImagePreviewProps {
  alt: string;
  className?: string;
  emptyLabel?: string;
  src?: string | null;
}

export function ImagePreview({
  alt,
  className,
  emptyLabel = "Aucune image",
  src,
}: ImagePreviewProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/45 px-4 py-8 text-sm text-slate-500",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} className="h-full w-full object-cover" src={src} />
    </div>
  );
}

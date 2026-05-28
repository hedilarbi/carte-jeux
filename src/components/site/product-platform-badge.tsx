import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export function ProductPlatformBadge({
  className,
  iconClassName,
  image,
  name = "Global",
  textClassName,
}: {
  className?: string;
  iconClassName?: string;
  image?: string;
  name?: string;
  textClassName?: string;
}) {
  const imageSrc = image ?? "/xbox.png";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 bg-[linear-gradient(6.39deg,rgba(1,45,105,0.82)_5.02%,rgba(1,45,105,0.82)_123.09%)] font-bold uppercase leading-3 text-white",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-[27px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.18)]",
          iconClassName,
        )}
      >
        <Image
          alt={name}
          className="h-full w-full object-contain"
          height={27}
          src={imageSrc}
          width={27}
        />
      </span>
      <span className={cn("truncate", textClassName)}>{name}</span>
    </div>
  );
}

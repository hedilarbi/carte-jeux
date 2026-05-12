import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  actionHref,
  actionLabel,
  eyebrow,
  title,
  subtitle,
}: {
  actionHref?: string;
  actionLabel?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <span className="font-mono text-[11px] font-bold uppercase text-brand-dark">
          {eyebrow}
        </span>
        <h2 className="mt-2 font-heading text-2xl font-bold text-brand-dark">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 whitespace-pre-line text-base text-brand-titanic-white">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="font-mono text-xs font-bold uppercase text-[#7FCCFF] transition hover:text-brand-dark"
          href={actionHref}
        >
          <span className="inline-flex items-center gap-1">
            {actionLabel}
            <ArrowRight className="size-3" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
}

export function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card className="border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sky-300/80">
            {hint}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-400/10 bg-sky-400/10 p-3 text-sky-300">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

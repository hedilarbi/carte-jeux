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
    <Card className="bg-[linear-gradient(180deg,#ffffff,#f8fbff)]">
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary/70">
            {hint}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sky-700">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

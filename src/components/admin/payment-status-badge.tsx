import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS } from "@/constants/admin";
import type { PaymentStatus } from "@/types/entities";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusVariantMap: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "muted",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

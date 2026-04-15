import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/constants/admin";
import type { OrderStatus } from "@/types/entities";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusVariantMap: Record<
  OrderStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  pending: "warning",
  paid: "default",
  processing: "muted",
  purchased: "default",
  delivered: "success",
  cancelled: "danger",
  failed: "danger",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

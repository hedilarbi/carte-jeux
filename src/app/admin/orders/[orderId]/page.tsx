import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderDetailManager } from "@/components/admin/order-detail-manager";
import { AppError } from "@/lib/utils/app-error";
import { orderService } from "@/services/order.service";

async function getOrderOrNotFound(orderId: string) {
  try {
    return await orderService.getById(orderId);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderOrNotFound(orderId);

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title={`Order ${order.orderNumber}`}
        description="Review the order, capture supplier data, and complete manual email delivery in one place."
      />
      <OrderDetailManager initialOrder={order} />
    </>
  );
}

import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { orderService } from "@/services/order.service";

export default async function AdminOrdersPage() {
  const orders = await orderService.list({ page: 1, limit: 100 });

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Track paid orders through sourcing, manual fulfillment, and customer delivery."
      />

      <Card>
        <CardHeader>
          <CardTitle>Order queue</CardTitle>
          <CardDescription className="mt-2">
            Manage operational progression from payment confirmation to manual
            code delivery by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-slate-950/30 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => (
                <tr key={order._id} className="border-b border-white/6 text-slate-300">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{order.orderNumber}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div>{order.customerEmail}</div>
                    <div className="mt-1">{formatDateTime(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-medium text-white">
                      {formatCurrency(order.total, order.currency)}
                    </div>
                    <div className="mt-1 text-slate-500">
                      {order.paymentProvider || "Provider pending"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div>{order.supplierPlatform || "Not purchased yet"}</div>
                    <div className="mt-1">
                      {order.supplierPurchaseReference || "No reference"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/6"
                    >
                      Open order
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    No orders are available yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

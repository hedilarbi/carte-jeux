import { countOrders, countPendingOrders } from "@/repositories/order.repository";
import { countProducts } from "@/repositories/product.repository";
import { countUsers } from "@/repositories/user.repository";

export async function getDashboardCounts() {
  const [totalProducts, totalOrders, totalUsers, pendingOrders] =
    await Promise.all([
      countProducts(),
      countOrders(),
      countUsers(),
      countPendingOrders(),
    ]);

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
  };
}

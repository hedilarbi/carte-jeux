import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CircleDollarSign,
  ClipboardList,
  Heart,
  LayoutDashboard,
  RotateCcw,
  Settings,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { getCustomerPageSession } from "@/lib/auth/customer";
import { customerAuthService } from "@/services/customer-auth.service";
import { orderService } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/entities";

const paidOrderStatuses = new Set<OrderStatus>([
  "paid",
  "processing",
  "purchased",
  "delivered",
]);

export default async function ProfilePage() {
  const session = await getCustomerPageSession();

  if (!session) {
    redirect("/connexion");
  }

  const user = await customerAuthService.getSessionUser(session.userId);

  if (!user) {
    redirect("/connexion");
  }

  const ordersResult = await orderService.list({
    customerEmail: user.email,
    limit: 100,
    page: 1,
  });
  const orders = ordersResult.items;
  const recentOrders = orders.slice(0, 3);
  const displayName = `${user.firstName} ${user.lastName}`.trim();
  const firstName = user.firstName || displayName.split(" ")[0] || "Client";
  const initials = getInitials(user.firstName, user.lastName, user.email);
  const totalSpent = orders.reduce((sum, order) => {
    if (order.paymentStatus === "paid" || paidOrderStatuses.has(order.status)) {
      return sum + order.total;
    }

    return sum;
  }, 0);
  const loyaltyTier = getLoyaltyTier(totalSpent, ordersResult.totalItems);

  return (
    <main className="relative min-h-[947px] overflow-hidden bg-[linear-gradient(90deg,#E3CDFF_0%,#D8E0FF_67.31%,#C9CAFF_100%)] px-5 py-8 text-[#012D69] sm:px-8">
      <section className="relative z-10 mx-auto w-full max-w-[1240px]">
        <p className="font-inter text-xs font-black tracking-[0.12em] text-[#240638]">
          {"// Mon compte"}
        </p>

        <div className="mt-9 grid gap-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:items-start">
          <ProfileSidebar
            displayName={displayName || "Client"}
            email={user.email}
            initials={initials}
            phone={user.phone}
          />

          <section className="min-w-0">
            <h1 className="font-inter text-[22px] font-black leading-7 text-[#012D69]">
              Bonjour, {firstName}
            </h1>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <StatCard
                icon={<ClipboardList className="size-9 text-[#F6A900]" />}
                label="Commande"
                value={String(ordersResult.totalItems)}
              />
              <StatCard
                icon={<CircleDollarSign className="size-10 text-[#F6A900]" />}
                label="Dépense"
                suffix={orders[0]?.currency ?? "TND"}
                value={formatProfilePrice(totalSpent)}
              />
              <StatCard
                icon={<Star className="size-9 text-white" />}
                iconClassName="bg-[#FFB000]"
                label="Fidélité"
                value={loyaltyTier}
              />
            </div>

            <RecentOrdersTable orders={recentOrders} />
          </section>
        </div>
      </section>
    </main>
  );
}

function ProfileSidebar({
  displayName,
  email,
  initials,
  phone,
}: {
  displayName: string;
  email: string;
  initials: string;
  phone?: string;
}) {
  return (
    <aside
      className="rounded-[19px] bg-[#DDE7FF]/70 p-3.5 shadow-[0_4px_8px_rgba(1,45,105,0.16)] backdrop-blur-sm"
      id="profil"
    >
      <div className="flex flex-col items-center px-2 pt-1 text-center">
        <span className="flex size-[92px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#78D3FF_0%,#A695EA_100%)] font-inter text-[28px] font-black leading-none text-white">
          {initials}
        </span>
        <h2 className="mt-3 max-w-full truncate font-inter text-[17px] font-black leading-6 text-[#012D69]">
          {displayName}
        </h2>
        <p className="mt-1 max-w-full truncate font-inter text-[15px] font-medium leading-5 text-[#012D69]">
          {email}
        </p>
        {phone ? (
          <p className="mt-1 max-w-full truncate font-inter text-[13px] font-bold leading-5 text-[#012D69]/70">
            {phone}
          </p>
        ) : null}
      </div>

      <div className="mt-3 h-px bg-[#A8BCE6]" />

      <nav className="mt-3 space-y-1.5 font-inter text-[15px] font-black tracking-[0.04em]">
        <SidebarItem active href="/profil" icon={<LayoutDashboard />}>
          Tableau de bord
        </SidebarItem>
        <SidebarItem href="/profil#commandes" icon={<ShoppingBag />}>
          Mes commandes
        </SidebarItem>
        <SidebarItem href="/favoris" icon={<Heart />}>
          Favoris
        </SidebarItem>
        <SidebarItem href="/profil#profil" icon={<Settings />}>
          Profil
        </SidebarItem>
      </nav>

      <div className="mt-6 h-px bg-[#A8BCE6]" />

      <div className="mt-4 font-inter text-[15px] font-black tracking-[0.04em]">
        <SidebarItem href="/produits" icon={<RotateCcw />}>
          Retour boutique
        </SidebarItem>
      </div>
    </aside>
  );
}

function SidebarItem({
  active = false,
  children,
  href,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  href: string;
  icon: ReactElement;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex h-[40px] items-center gap-3 bg-[#9BCBF4] px-2 text-[#123C70]"
          : "flex h-[40px] items-center gap-3 px-2 text-[#294A7A] hover:bg-white/35"
      }
      href={href}
    >
      <span className="flex size-[28px] shrink-0 items-center justify-center text-[#0A8ED8] [&>svg]:size-[24px]">
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

function StatCard({
  icon,
  iconClassName = "",
  label,
  suffix,
  value,
}: {
  icon: ReactNode;
  iconClassName?: string;
  label: string;
  suffix?: string;
  value: string;
}) {
  return (
    <article className="flex min-h-[110px] items-center justify-between rounded-[16px] bg-[#F4F6FF]/85 px-5 py-4 shadow-[0_3px_5px_rgba(1,45,105,0.18)]">
      <div className="min-w-0">
        <p className="font-inter text-[28px] font-black leading-none text-[#9E91E9]">
          {value}
          {suffix ? (
            <span className="ml-1 align-middle text-base font-black">
              {suffix}
            </span>
          ) : null}
        </p>
        <p className="mt-2 font-inter text-[15px] font-black uppercase leading-4 tracking-[0.04em] text-[#012D69]">
          {label}
        </p>
      </div>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </span>
    </article>
  );
}

function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <article
      className="mt-4 overflow-hidden rounded-[18px] bg-[#F1F3FC]/82 shadow-[0_4px_6px_rgba(1,45,105,0.16)]"
      id="commandes"
    >
      <header className="bg-[linear-gradient(90deg,#8FCBF3_0%,#A9A2ED_100%)] px-5 py-5">
        <h2 className="font-inter text-[17px] font-black leading-5 text-[#123C70]">
          Dernières commandes
        </h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse font-inter text-[13px] text-[#2C568B]">
          <thead>
            <tr className="h-[34px] bg-[#D9E8FA] text-left text-[13px] font-semibold uppercase tracking-[0.06em]">
              <th className="px-5">Commande</th>
              <th className="px-4">Produit</th>
              <th className="px-4">Montant</th>
              <th className="px-4">Statut</th>
              <th className="px-4">Point merci</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr className="h-[35px]" key={order._id}>
                  <td className="px-5 font-medium text-[#5A77A4]">
                    #{order.orderNumber}
                  </td>
                  <td className="max-w-[210px] truncate px-4 font-medium">
                    {order.items[0]?.productTitle ?? "Produit"}
                  </td>
                  <td className="px-4 font-black">
                    {formatProfilePrice(order.total)} {order.currency}
                  </td>
                  <td className="px-4 font-black">
                    <OrderStatusLabel status={order.status} />
                  </td>
                  <td className="px-4 font-medium">
                    {getOrderPoints(order.total)} points
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-5 py-10 text-center text-sm font-semibold text-[#2C568B]/70"
                  colSpan={5}
                >
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function OrderStatusLabel({ status }: { status: OrderStatus }) {
  const label = getStatusLabel(status);
  const colorClass =
    status === "delivered"
      ? "text-[#09B526]"
      : status === "pending"
        ? "text-[#F1B600]"
        : status === "cancelled" || status === "failed"
          ? "text-[#D74242]"
          : "text-[#2C568B]";

  return <span className={colorClass}>{label}</span>;
}

function getInitials(firstName: string, lastName: string, email: string) {
  const initials = [firstName, lastName]
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join(".");

  if (initials) {
    return initials.toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

function getLoyaltyTier(totalSpent: number, totalOrders: number) {
  if (totalSpent >= 300 || totalOrders >= 10) {
    return "Gold";
  }

  if (totalSpent >= 100 || totalOrders >= 4) {
    return "Silver";
  }

  return "Bronze";
}

function getOrderPoints(total: number) {
  return Math.max(1, Math.round(total / 5));
}

function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    cancelled: "Annulé",
    delivered: "Livré",
    failed: "Échoué",
    paid: "Payé",
    pending: "En attente",
    processing: "En cours",
    purchased: "Acheté",
  };

  return labels[status];
}

function formatProfilePrice(value: number) {
  return value.toFixed(3).replace(".", ",");
}

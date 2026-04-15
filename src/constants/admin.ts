import type {
  DeliveryMode,
  OrderStatus,
  PaymentStatus,
  ProductType,
  PromoCampaignType,
  UserRole,
} from "@/types/entities";

export const APP_NAME = "Eneba Digital Marketplace";
export const ADMIN_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export const USER_ROLE_OPTIONS: UserRole[] = ["admin", "customer"];

export const PRODUCT_TYPE_OPTIONS: ProductType[] = [
  "gift_card",
  "subscription",
  "game_credit",
];

export const DELIVERY_MODE_OPTIONS: DeliveryMode[] = ["manual_email"];

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "purchased",
  "delivered",
  "cancelled",
  "failed",
];

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export const PROMO_CAMPAIGN_TYPE_OPTIONS: PromoCampaignType[] = ["percentage"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  purchased: "Purchased",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  gift_card: "Gift Card",
  subscription: "Subscription",
  game_credit: "Game Credit",
};

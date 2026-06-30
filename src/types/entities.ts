export type UserRole = "admin" | "customer" | "guest";
export type AuthProvider = "local" | "google" | "facebook";
export type ProductType = "gift_card" | "subscription" | "game_credit";
export type DeliveryMode = "manual_email";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "purchased"
  | "delivered"
  | "cancelled"
  | "failed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PromoCampaignType = "percentage";
export type PromoCodeDiscountType = "percentage" | "fixed";
export type CartStatus = "active" | "converted" | "abandoned";
export type ContactSubmissionStatus = "new" | "replied";

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  authProviders?: AuthProvider[];
  googleId?: string;
  facebookId?: string;
  profileCompletedAt?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: string;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isPlateforme: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Region {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Product extends BaseEntity {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  gallery: string[];
  categoryId: string;
  categoryIds: string[];
  platformId: string;
  regionId?: string;
  regionIds: string[];
  faceValue: number;
  currency: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  sku: string;
  productType: ProductType;
  deliveryMode: DeliveryMode;
  isFeatured: boolean;
  isActive: boolean;
  faqItems: ProductFaqItem[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface CartItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  platformName?: string;
  platformImage?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface Cart extends BaseEntity {
  sessionId: string;
  userId?: string;
  status: CartStatus;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  promoDiscountAmount?: number;
  total: number;
  currency: string;
  appliedPromoCode?: AppliedPromoCode | null;
}

export interface FavoriteItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  platformName?: string;
  platformImage?: string;
  sku: string;
  price: number;
  currency: string;
}

export interface FavoriteList extends BaseEntity {
  sessionId?: string;
  userId?: string;
  items: FavoriteItem[];
}

export interface OrderItem {
  productId?: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: string;
  appliedPromoCode?: AppliedPromoCode | null;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail: string;
  customerPhone?: string;
  supplierPlatform?: string;
  supplierPurchaseReference?: string;
  supplierCost?: number;
  internalNote?: string;
  deliveryMethod: "email";
  deliveredCode?: string;
  deliveryNote?: string;
  deliveredAt?: string;
  paymentProvider?: string;
  paymentReference?: string;
  paidAt?: string;
}

export interface PromoCampaign extends BaseEntity {
  name: string;
  type: PromoCampaignType;
  value: number;
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface PromoCode extends BaseEntity {
  code: string;
  type: PromoCodeDiscountType;
  value: number;
  expiresAt: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
}

export interface AppliedPromoCode {
  promoCodeId: string;
  code: string;
  type: PromoCodeDiscountType;
  value: number;
  discountAmount?: number;
  initialTotal?: number;
  discountedTotal?: number;
}

export interface BestSellerItem extends BaseEntity {
  productId: string;
  product?: Product;
  sortOrder: number;
}

export interface ContactSubmissionReply {
  _id?: string;
  message: string;
  sentTo: string;
  sentAt: string;
  adminEmail?: string;
}

export interface ContactSubmission extends BaseEntity {
  platform: string;
  requestType: string;
  productName: string;
  region: string;
  budget: string;
  payment: string;
  email: string;
  phone?: string;
  status: ContactSubmissionStatus;
  replies: ContactSubmissionReply[];
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
}

export interface AdminSession {
  userId?: string;
  email: string;
  role: "admin";
  source: "cookie" | "header" | "dev-bypass";
}

export interface CustomerSession {
  userId: string;
  email: string;
  role: "customer";
  source: "cookie";
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileCompletedAt?: string;
  role: UserRole;
  authProviders: AuthProvider[];
}

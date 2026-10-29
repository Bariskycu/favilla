export type ProductType = 'jar' | 'sculptural' | 'set';
export type ProductColor = 'natural' | 'charcoal' | 'terracotta';
export type ProductMaterial = 'soy-wax' | 'beeswax' | 'coconut-blend';

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  discountPrice?: number;
  type: ProductType;
  color: ProductColor;
  material: ProductMaterial;
  image: string;
  hoverImage: string;
  description: string;
  rating: number;
  reviewCount: number;
  burnTime?: string; // New attribute specific to candles
  scentProfile?: string; // New attribute
  stock: number; // Inventory count
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CouponResponse {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  valid: boolean;
}

export interface CheckoutRequest {
  addressId: string;
  couponCode?: string;
  cardInfo: {
    number: string;
    // New Recommended Format
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    // Old Format (Supported)
    expiry?: string;
    name?: string;
    // Common
    cvv: string;
  };
}

export interface CheckoutResponse {
  id: string;
  orderNo: string;
  createdAt: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNo: string;
  createdAt: string; // Used to be date
  status: OrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  items: OrderItem[];
  address?: Address; // Added optional address as it is in detail view
}

export interface OrdersResponse {
  data: Order[];
  pagination: Pagination;
}

export interface Address {
  id: string;
  title: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved';

export interface SupportTicket {
  id: string;
  createdAt: string;
  subject: string;
  orderNo?: string;
  message: string;
  status: TicketStatus;
}

export interface SupportTicketRequest {
  subject: string;
  message: string;
  orderNo?: string;
}

export interface SupportTicketsResponse {
  data: SupportTicket[];
  pagination: Pagination;
}

export interface ProductQuestion {
  id: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  answeredAt?: string;
  createdAt?: string;
  productId?: string;
  product?: Product;
}

export interface ProductQuestionsResponse {
  data: ProductQuestion[];
  pagination: Pagination;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewsResponse {
  data: Review[];
  pagination: Pagination;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  phone: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface AuthData {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

// Common Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  email_verified?: boolean;
}

// Product Types
export type ProductType = 'jar' | 'sculptural' | 'set';
export type ProductColor = 'natural' | 'charcoal' | 'terracotta';
export type ProductMaterial = 'soy-wax' | 'beeswax' | 'coconut-blend';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;

  type: ProductType;
  color: ProductColor;
  material?: ProductMaterial;

  images: string[];

  burnTime?: string;
  scentProfile?: string;

  rating?: number;
  reviewCount?: number;

  isActive: boolean;
  status: ProductStatus;
  stockStatus?: StockStatus;

  createdAt?: string;
  updatedAt?: string;
}

// Order Types
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string;
  changedByName: string;
  note?: string;
  createdAt: string;
}

export interface ShippingAddress {
  title: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress?: ShippingAddress;

  items?: OrderItem[]; // Detail endpoint provides items

  subtotal?: number;
  discountAmount?: number;
  total: number;

  paymentMethod?: string;
  isPaid?: boolean;

  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];

  itemCount?: number; // List endpoint provides itemCount

  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface CustomerAddress {
  id: string;
  title: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer';
  isActive: boolean;

  totalSpent: number;
  orderCount: number;
  isVip: boolean;

  addresses?: CustomerAddress[];
  recentOrders?: Partial<Order>[]; // Simplified order objects

  lastOrderDate?: string;
  createdAt: string;
  updatedAt?: string;

  notes?: string; // If added via separate endpoint or field
}

// Dashboard Types
export interface DashboardStats {
  totalSales: StatItem;
  activeOrders: StatItem;
  totalCustomers: StatItem;
  stockStatus: StockStatItem;
  salesTarget: SalesTargetItem;
}

export interface StatItem {
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface StockStatItem extends StatItem {
  lowStockCount: number;
  outOfStockCount: number;
}

export interface SalesTargetItem {
  current: number;
  target: number;
  percentage: number;
}

export interface SalesChartData {
  period: 'week' | 'month' | 'year';
  data: {
    date: string;
    sales: number;
    orders: number;
  }[];
}

// Settings Types
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

export interface NotificationSettings {
  emailNotifications: {
    newOrder: boolean;
    lowStock: boolean;
    customerSupport: boolean;
  };
  pushNotifications: {
    enabled: boolean;
  };
}

export interface ShippingProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export interface ShippingSettings {
  defaultShippingCost: number;
  freeShippingThreshold: number;
  shippingProviders: ShippingProvider[];
}

// Audit Logs Types
export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  status: 'success' | 'failed' | 'error';
  error_message?: string;
  created_at: string;
}

export interface AuditLogFilters {
  admin_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  status?: 'success' | 'failed' | 'error';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// System Health Types
export interface SystemHealth {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: 'ok' | 'error' | 'unknown';
    pool: 'ok' | 'warning' | 'critical' | 'unknown';
  };
  poolMetrics?: any;
}

// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  orderNo?: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}
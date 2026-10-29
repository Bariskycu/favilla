import { z } from 'zod';

// Basic Enums
export const ProductTypeSchema = z.enum(['jar', 'sculptural', 'set']);
export const ProductColorSchema = z.enum(['natural', 'charcoal', 'terracotta']);
export const ProductMaterialSchema = z.enum(['soy-wax', 'beeswax', 'coconut-blend']);
export const OrderStatusSchema = z.enum(['pending', 'processing', 'shipped', 'delivered']);
export const TicketStatusSchema = z.enum(['open', 'in-progress', 'resolved']);

// Basic Types
export const AddressSchema = z.object({
    id: z.string(),
    title: z.string(),
    line1: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string(),
});

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    addresses: z.array(AddressSchema).default([]),
});

export const AuthDataSchema = z.object({
    user: UserSchema,
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
});

export const ProductSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    tagline: z.string(),
    price: z.number(),
    discountPrice: z.number().nullable().optional().transform(val => val ?? undefined),
    type: ProductTypeSchema,
    color: ProductColorSchema,
    material: ProductMaterialSchema,
    image: z.string(),
    hoverImage: z.string(),
    description: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    burnTime: z.string().optional(),
    scentProfile: z.string().optional(),
    stock: z.number().default(0),
});

export const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
});

export const ProductsResponseSchema = z.object({
    data: z.array(ProductSchema),
    pagination: PaginationSchema,
});

export const CartItemSchema = z.object({
    productId: z.string(),
    product: ProductSchema,
    quantity: z.number(),
    subtotal: z.number(),
});

export const CartDataSchema = z.object({
    items: z.array(CartItemSchema),
    total: z.number(),
    itemCount: z.number(),
});

export const CouponResponseSchema = z.object({
    code: z.string(),
    discount: z.number(),
    discountType: z.enum(['percentage', 'fixed']),
    valid: z.boolean(),
});

export const OrderItemSchema = z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    image: z.string(),
});

export const OrderSchema = z.object({
    id: z.string(),
    orderNo: z.string(),
    createdAt: z.string(),
    status: OrderStatusSchema,
    total: z.number(),
    subtotal: z.number(),
    discount: z.number(),
    items: z.array(OrderItemSchema),
    address: AddressSchema.optional(),
});

export const OrdersResponseSchema = z.object({
    data: z.array(OrderSchema),
    pagination: PaginationSchema,
});

export const CheckoutResponseSchema = z.object({
    id: z.string(),
    orderNo: z.string(),
    createdAt: z.string(),
    status: z.string(),
    total: z.number(),
    subtotal: z.number(),
    discount: z.number(),
    items: z.array(OrderItemSchema),
});

export const SupportTicketSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    subject: z.string(),
    orderNo: z.string().optional(),
    message: z.string(),
    status: TicketStatusSchema,
});

export const SupportTicketsResponseSchema = z.object({
    data: z.array(SupportTicketSchema),
    pagination: PaginationSchema,
});

export const ProductQuestionSchema = z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string().optional(),
    status: z.enum(['pending', 'answered']),
    answeredAt: z.string().optional(),
    createdAt: z.string().optional(),
    productId: z.string().optional(),
    product: ProductSchema.optional(),
});

export const ProductQuestionsResponseSchema = z.object({
    data: z.array(ProductQuestionSchema),
    pagination: PaginationSchema,
});

export const WishlistItemSchema = z.object({
    productId: z.string(),
    product: ProductSchema,
    addedAt: z.string(),
});

export const ReviewSchema = z.object({
    id: z.string(),
    userId: z.string(),
    userName: z.string(),
    rating: z.number(),
    comment: z.string(),
    createdAt: z.string(),
    verifiedPurchase: z.boolean(),
});

export const ReviewsResponseSchema = z.object({
    data: z.array(ReviewSchema),
    pagination: PaginationSchema,
});

export const GenericStatusSchema = z.object({
    status: z.string(),
});

export const IsInWishlistSchema = z.object({
    isInWishlist: z.boolean(),
});

export const IsEligibleSchema = z.object({
    isEligible: z.boolean(),
});

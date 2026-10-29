// favilla-candle/services/api.ts
import axiosClient from './axiosClient';
import { User, Order, SupportTicket, SupportTicketRequest, SupportTicketsResponse, ProductQuestion, Product, Address, ProductsResponse, CartData, CartItem, CouponResponse, CheckoutRequest, CheckoutResponse, OrdersResponse, WishlistItem, ReviewsResponse, ReviewRequest, Review, ProductQuestionsResponse, LoginRequest, RegisterRequest, AuthData } from '../types';
import { Language } from '../store';
import {
  AuthDataSchema,
  UserSchema,
  ProductsResponseSchema,
  ProductSchema,
  OrdersResponseSchema,
  OrderSchema,
  SupportTicketsResponseSchema,
  SupportTicketSchema,
  ProductQuestionsResponseSchema,
  ProductQuestionSchema,
  CartDataSchema,
  CouponResponseSchema,
  CheckoutResponseSchema,
  WishlistItemSchema,
  ReviewsResponseSchema,
  ReviewSchema,
  AddressSchema,
  IsInWishlistSchema,
  IsEligibleSchema
} from './schemas';
import { z } from 'zod';

// Backend yanıt tipleri için yardımcı interface'ler
interface GenericResponse<T> {
  status: string;
  data: T;
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthData> => {
      // Backend POST /api/v1/auth/login bekliyor (baseURL /api/v1, endpoint /auth/login)
      const response = await axiosClient.post<GenericResponse<AuthData>, LoginRequest>('/auth/login', { email, password });
      return AuthDataSchema.parse(response);
    },

    register: async (email: string, name: string, phone: string, password: string): Promise<User> => {
      // Backend POST /api/v1/auth/register bekliyor
      const response = await axiosClient.post<GenericResponse<AuthData>, RegisterRequest>('/auth/register', {
        email,
        name,
        phone,
        password
      });
      // axiosClient interceptor returns data.data (AuthData)
      const authData = AuthDataSchema.parse(response);
      return authData.user;
    },

    // Profil güncelleme
    updateProfile: async (data: Partial<User>): Promise<User> => {
      const response = await axiosClient.patch<GenericResponse<User>, Partial<User>>('/users/profile', data);
      return UserSchema.parse(response);
    },

    forgotPassword: async (email: string): Promise<void> => {
      await axiosClient.post('/auth/forgot-password', { email });
    },

    refresh: async (): Promise<void> => {
      // Refresh token is now handled via HttpOnly cookie
      await axiosClient.post('/auth/refresh');
    },

    logout: async (): Promise<void> => {
      // Calls backend to clear cookies
      await axiosClient.post('/auth/logout');
    },
  },

  products: {
    getAll: async (params: { page?: number; limit?: number; search?: string; type?: string; color?: string; material?: string; minPrice?: number; maxPrice?: number; sort?: string; lang?: Language }): Promise<ProductsResponse> => {
      const response = await axiosClient.get<GenericResponse<ProductsResponse>>('/products', { params });
      return ProductsResponseSchema.parse(response);
    },

    getById: async (id: string): Promise<Product> => {
      const response = await axiosClient.get<GenericResponse<Product>>(`/products/${id}`);
      return ProductSchema.parse(response);
    },

    getBySlug: async (slug: string): Promise<Product> => {
      const response = await axiosClient.get<GenericResponse<Product>>(`/products/${slug}`);
      return ProductSchema.parse(response);
    },
  },

  orders: {
    getAll: async (page = 1, limit = 20): Promise<OrdersResponse> => {
      const response = await axiosClient.get<GenericResponse<OrdersResponse>>('/orders', { params: { page, limit } });
      return OrdersResponseSchema.parse(response);
    },

    getById: async (id: string): Promise<Order> => {
      const response = await axiosClient.get<GenericResponse<Order>>(`/orders/${id}`);
      return OrderSchema.parse(response);
    },

    create: async (items: CartItem[], total: number): Promise<Order> => {
      const response = await axiosClient.post<GenericResponse<Order>, { items: CartItem[], total: number }>('/orders', { items, total });
      return OrderSchema.parse(response);
    },
  },

  tickets: {
    getAll: async (page = 1, limit = 20): Promise<SupportTicketsResponse> => {
      const response = await axiosClient.get<GenericResponse<SupportTicketsResponse>>('/support', { params: { page, limit } });
      return SupportTicketsResponseSchema.parse(response);
    },
    create: async (data: SupportTicketRequest): Promise<SupportTicket> => {
      const response = await axiosClient.post<GenericResponse<SupportTicket>, SupportTicketRequest>('/support', data);
      return SupportTicketSchema.parse(response);
    },
  },

  questions: {
    // Bu endpoint backend'de tanımlanmalı veya düzenlenmeli
    getByProduct: async (productId: string, page = 1, limit = 10): Promise<ProductQuestionsResponse> => {
      const response = await axiosClient.get<GenericResponse<ProductQuestionsResponse>>(`/questions/${productId}`, { params: { page, limit } });
      return ProductQuestionsResponseSchema.parse(response);
    },
    ask: async (productId: string, question: string): Promise<ProductQuestion> => {
      const response = await axiosClient.post<GenericResponse<ProductQuestion>, { question: string }>(`/questions/${productId}`, { question });
      return ProductQuestionSchema.parse(response);
    },
    getMyQuestions: async (page = 1, limit = 20): Promise<ProductQuestionsResponse> => {
      const response = await axiosClient.get<GenericResponse<ProductQuestionsResponse>>('/questions/my/all', { params: { page, limit } });
      return ProductQuestionsResponseSchema.parse(response);
    },
  },

  // Sepet İşlemleri
  cart: {
    get: async (): Promise<CartData> => {
      const response = await axiosClient.get<GenericResponse<CartData>>('/cart');
      return CartDataSchema.parse(response);
    },
    add: async (productId: string, quantity: number): Promise<void> => {
      await axiosClient.post('/cart/add', { productId, quantity });
    },
    remove: async (productId: string): Promise<void> => {
      await axiosClient.delete(`/cart/${productId}`);
    },
    update: async (productId: string, quantity: number): Promise<void> => {
      await axiosClient.put(`/cart/${productId}`, { quantity });
    },
    validateCoupon: async (code: string): Promise<CouponResponse> => {
      const response = await axiosClient.post<GenericResponse<CouponResponse>, { code: string }>('/cart/coupon', { code });
      return CouponResponseSchema.parse(response);
    },
    checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
      const response = await axiosClient.post<GenericResponse<CheckoutResponse>, CheckoutRequest>('/cart/checkout', data);
      return CheckoutResponseSchema.parse(response);
    },
  },

  wishlist: {
    getAll: async (): Promise<WishlistItem[]> => {
      const response = await axiosClient.get<GenericResponse<WishlistItem[]>>('/wishlist');
      return z.array(WishlistItemSchema).parse(response);
    },
    add: async (productId: string): Promise<boolean> => {
      const response = await axiosClient.post<GenericResponse<{ isInWishlist: boolean }>, { productId: string }>('/wishlist', { productId });
      return IsInWishlistSchema.parse(response).isInWishlist;
    },
    remove: async (productId: string): Promise<void> => {
      await axiosClient.delete(`/wishlist/${productId}`);
    },
    check: async (productId: string): Promise<boolean> => {
      const response = await axiosClient.get<GenericResponse<{ isInWishlist: boolean }>>(`/wishlist/${productId}/check`);
      return IsInWishlistSchema.parse(response).isInWishlist;
    },
  },

  reviews: {
    getAll: async (productId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
      const response = await axiosClient.get<GenericResponse<ReviewsResponse>>(`/reviews/${productId}`, { params: { page, limit } });
      return ReviewsResponseSchema.parse(response);
    },
    create: async (productId: string, data: ReviewRequest): Promise<Review> => {
      const response = await axiosClient.post<GenericResponse<Review>, ReviewRequest>(`/reviews/${productId}`, data);
      return ReviewSchema.parse(response);
    },
    checkEligibility: async (productId: string): Promise<boolean> => {
      const response = await axiosClient.get<GenericResponse<{ isEligible: boolean }>>(`/reviews/${productId}/check`);
      return IsEligibleSchema.parse(response).isEligible;
    },
  },

  user: {
    getProfile: async (): Promise<User> => {
      const response = await axiosClient.get<GenericResponse<User>>('/users/profile');
      return UserSchema.parse(response);
    },
    // Profil güncelleme (İsim, Telefon, Şifre)
    updateProfile: async (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string; confirmPassword?: string }): Promise<User> => {
      // Backend rotası: PUT /users/profile
      const response = await axiosClient.put<GenericResponse<User>, typeof data>('/users/profile', data);
      return UserSchema.parse(response);
    },
    getAddresses: async (): Promise<Address[]> => {
      const response = await axiosClient.get<GenericResponse<Address[]>>('/users/addresses');
      return z.array(AddressSchema).parse(response);
    },
    addAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
      const response = await axiosClient.post<GenericResponse<Address>, Omit<Address, 'id'>>('/users/addresses', address);
      return AddressSchema.parse(response);
    },
    updateAddress: async (id: string, address: Partial<Address>): Promise<Address> => {
      const response = await axiosClient.put<GenericResponse<Address>, Partial<Address>>(`/users/addresses/${id}`, address);
      return AddressSchema.parse(response);
    },
    deleteAddress: async (id: string): Promise<void> => {
      await axiosClient.delete<GenericResponse<void>>(`/users/addresses/${id}`);
    },
  },

  payment: {
    initialize: async (data: any): Promise<any> => {
      const response = await axiosClient.post<any>('/payment/initialize', data);
      return response;
    }
  }
};
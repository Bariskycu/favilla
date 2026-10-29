import axiosClient from './axiosClient';
import {
    User,
    ApiResponse,
    DashboardStats,
    SalesChartData,
    Product,
    ProductStatus,
    StockStatus,
    Order,
    OrderStatus,
    Customer,
    GeneralSettings,
    NotificationSettings,
    ShippingSettings,
    SupportTicket
} from '../types';

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            const response = await axiosClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/login', { email, password });
            return response.data;
        },
        refresh: async (refreshToken: string) => {
            const response = await axiosClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
            return response.data;
        },
        me: async () => {
            const response = await axiosClient.get<ApiResponse<{ user: User }>>('/auth/me');
            return response.data;
        },
        logout: async (refreshToken?: string) => {
            const response = await axiosClient.post<ApiResponse<void>>('/auth/logout', { refreshToken });
            return response.data;
        }
    },

    // Not in Doc - Mocked for UI stability
    dashboard: {
        getStats: async () => {
            // Mocking as not in provided docs
            return {
                success: true,
                data: {
                    totalSales: { value: 0, change: 0, trend: 'up' },
                    activeOrders: { value: 0, change: 0, trend: 'up' },
                    totalCustomers: { value: 0, change: 0, trend: 'up' },
                    stockStatus: { value: 0, change: 0, trend: 'down', lowStockCount: 0, outOfStockCount: 0 },
                    salesTarget: { current: 0, target: 100, percentage: 0 }
                } as DashboardStats
            };
        },
        getSalesChart: async (period: string = 'month') => {
            return {
                success: true,
                data: { period, data: [] } as any
            };
        },
        getRecentOrders: async (limit: number = 5) => {
            // Use real orders endpoint
            const response = await axiosClient.get<ApiResponse<Order[]>>(`/orders?limit=${limit}`);
            return response.data;
        }
    },

    products: {
        getAll: async (params: {
            page?: number;
            limit?: number;
            search?: string;
            type?: string;
            color?: string;
            material?: string;
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
            status?: ProductStatus; // Not strictly in Doc 3.1 but useful
        } = {}) => {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== 'all') {
                    queryParams.append(key, value.toString());
                }
            });

            // Doc 3.1
            const response = await axiosClient.get<ApiResponse<Product[]>>(`/products?${queryParams}`);
            return response.data;
        },
        getById: async (id: string) => {
            // Doc 3.2
            const response = await axiosClient.get<ApiResponse<Product>>(`/products/${id}`);
            return response.data;
        },
        create: async (data: Partial<Product>) => {
            // Doc 3.3
            const response = await axiosClient.post<ApiResponse<Product>>('/products', data);
            return response.data;
        },
        update: async (id: string, data: Partial<Product>) => {
            // Doc 3.4
            const response = await axiosClient.put<ApiResponse<Product>>(`/products/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            // Doc 3.5
            const response = await axiosClient.delete<ApiResponse<void>>(`/products/${id}`);
            return response.data;
        }
    },

    orders: {
        getAll: async (params: {
            page?: number;
            limit?: number;
            sort?: string;
            // Doc 5.1 only lists page/limit. We'll pass others just in case but relying on doc 5.1
        } = {}) => {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });

            // Doc 5.1
            const response = await axiosClient.get<ApiResponse<Order[]>>(`/orders?${queryParams}`);
            return response.data;
        },
        getById: async (id: string) => {
            // Doc 5.2
            const response = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);
            return response.data;
        },
        // Helpers that might not exist in backend but used in UI
        updateStatus: async (id: string, status: OrderStatus) => {
            // Try generic update if supported, else this will fail (404/405)
            // Doc does not specify update status endpoint.
            throw new Error("Update status not supported by API Documentation");
        },
        cancel: async (id: string, reason: string) => {
            // Doc does not specify cancel endpoint.
            throw new Error("Cancel not supported by API Documentation");
        },
        updateCustomer: async (id: string, data: any) => {
            throw new Error("Update customer not supported by API Documentation");
        }
    },

    // Support (Doc 9)
    support: {
        getAll: async (params: { page?: number; limit?: number } = {}) => {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            // Doc 9.2
            const response = await axiosClient.get<ApiResponse<SupportTicket[]>>(`/support?${queryParams}`);
            return response.data;
        },
        create: async (data: { subject: string; message: string; orderNo?: string }) => {
            // Doc 9.1
            const response = await axiosClient.post<ApiResponse<SupportTicket>>('/support', data);
            return response.data;
        }
    },

    // Not in Doc
    customers: {
        getAll: async () => {
            return { success: true, data: [] as Customer[] }; // Mock
        },
        getById: async () => {
            return { success: false, message: "Not implemented" };
        }
    },

    // Not in Doc
    settings: {
        getGeneral: async () => ({ success: true, data: {} as GeneralSettings }),
        updateGeneral: async () => ({ success: false, message: "Not implemented" }),
        getProfile: async () => {
            // Use /auth/me instead?
            return api.auth.me();
        },
        updateProfile: async (data: any) => {
            // Doc 2.2
            const response = await axiosClient.put<ApiResponse<User>>('/users/profile', data);
            return response.data;
        }
    },

    media: {
        upload: async (file: File) => {
            const formData = new FormData();
            formData.append('image', file); // Doc 10.1 says field is 'image'
            // Doc 10.1
            const response = await axiosClient.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        }
    },

    audit: {
        getAll: async (params: import('../types').AuditLogFilters = {}) => {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
            // Doc 11.1
            const response = await axiosClient.get<ApiResponse<import('../types').AuditLog[]>>(`/audit-logs?${queryParams}`);
            return response.data;
        },
        getById: async (id: string) => {
            // Doc 11.2
            const response = await axiosClient.get<ApiResponse<import('../types').AuditLog>>(`/audit-logs/${id}`);
            return response.data;
        }
    },

    health: {
        getApiStatus: async () => {
            const baseURL = axiosClient.defaults.baseURL || '';
            const rootUrl = baseURL.replace(/\/api\/v1\/?$/, '');
            const response = await import('axios').then(a => a.default.get<{ message: string }>(`${rootUrl}/`));
            return response.data;
        },
        getSystemHealth: async () => {
            const baseURL = axiosClient.defaults.baseURL || '';
            const rootUrl = baseURL.replace(/\/api\/v1\/?$/, '');
            const response = await import('axios').then(a => a.default.get<import('../types').SystemHealth>(`${rootUrl}/api/health`));
            return response.data;
        }
    }
};

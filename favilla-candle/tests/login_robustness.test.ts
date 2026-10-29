
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
    api: {
        auth: {
            login: vi.fn()
        },
        orders: {
            getAll: vi.fn(),
            create: vi.fn()
        },
        tickets: {
            getAll: vi.fn(),
            create: vi.fn()
        },
        questions: {
            getMyQuestions: vi.fn(),
            ask: vi.fn() // Add these if missing from original mock but needed
        },
        cart: {
            fetchCart: vi.fn(),
            get: vi.fn()
        },
        user: {
            getAddresses: vi.fn()
        },
        wishlist: {
            getAll: vi.fn()
        }
    }
}));

describe('Store Login Robustness', () => {
    beforeEach(() => {
        useStore.setState({
            user: null,
            isAuthenticated: false,
            orders: [],
            tickets: []
        });
        vi.clearAllMocks();
    });

    it('should handle null response from getAll gracefully', async () => {
        // Mock login success
        // @ts-ignore
        api.auth.login.mockResolvedValue({
            user: { id: '1', name: 'Test User', email: 'test@example.com', addresses: [] },
            accessToken: 'token',
            refreshToken: 'refresh'
        });

        // Mock getAll returning null (simulating the bug source)
        // @ts-ignore
        api.orders.getAll.mockResolvedValue(null);

        // Mock getMyTickets returning null
        // @ts-ignore
        api.tickets.getAll.mockResolvedValue(null);

        // Mock other calls to avoid errors
        // @ts-ignore
        api.questions.getMyQuestions.mockResolvedValue({ data: [] });
        // @ts-ignore
        api.user.getAddresses.mockResolvedValue([]);
        // @ts-ignore
        api.cart.get.mockResolvedValue({ items: [] });
        // @ts-ignore
        api.wishlist.getAll.mockResolvedValue([]);

        await useStore.getState().login('test@example.com', 'password');

        const state = useStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.orders).toEqual([]); // Should be empty array, not null
        expect(state.tickets).toEqual([]); // Should be empty array, not null
    });
});

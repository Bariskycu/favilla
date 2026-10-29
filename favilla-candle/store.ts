import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, User, Order, Address, SupportTicket, ProductQuestion, ToastMessage, CheckoutRequest, Review, WishlistItem } from './types';
import { api } from './services/api';
import i18n from './i18n';

export type Language = 'en' | 'tr';

interface StoreState {
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>;
  toggleCart: (isOpen?: boolean) => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;

  // Wishlist
  wishlist: string[]; // Store Product IDs
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<WishlistItem[]>;

  // Search
  isSearchOpen: boolean;
  toggleSearch: (isOpen?: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Coupon
  // Coupon
  couponCode: string | null;
  discountPercentage: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Auth & User
  user: User | null;
  isAuthenticated: boolean;
  verifySession: () => Promise<void>;
  // SECURITY NOTE: Storing tokens in localStorage is vulnerable to XSS. 
  // Trusted inputs are critical. Consider httpOnly cookies in backend for production.
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Parameters<typeof api.user.updateProfile>[0]) => Promise<void>;
  fetchProfile: () => Promise<void>;

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (checkoutData: CheckoutRequest) => Promise<void>;
  fetchOrder: (id: string) => Promise<Order | null>;
  fetchOrders: () => Promise<void>;

  // Addresses
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;

  // Support
  tickets: SupportTicket[];
  submitTicket: (subject: string, message: string, orderNo?: string) => Promise<void>;
  fetchTickets: () => Promise<void>;

  // Product Q&A
  productQuestions: ProductQuestion[];
  submitProductQuestion: (product: Product, question: string) => Promise<void>;
  fetchProductQuestions: () => Promise<void>;

  // Reviews
  submitReview: (productId: string, rating: number, comment: string) => Promise<Review>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      isCartOpen: false,
      addToCart: async (product, quantity = 1) => {
        const { isAuthenticated, cart, addToast, fetchCart } = get();

        // Optimistic UI Update: Show item immediately
        const tempId = 'temp-' + Date.now();
        const existingItemIndex = cart.findIndex(item => item.productId === product.id);

        let previousCart = [...cart];
        let newCart = [...cart];

        // Prepare the new cart state locally
        if (existingItemIndex > -1) {
          const existingItem = newCart[existingItemIndex];
          newCart[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            subtotal: (existingItem.product.discountPrice || existingItem.product.price) * (existingItem.quantity + quantity)
          };
        } else {
          newCart.push({
            productId: product.id,
            product,
            quantity,
            subtotal: (product.discountPrice || product.price) * quantity
          });
        }

        // Apply local state immediately
        set({ cart: newCart, isCartOpen: true });
        addToast(i18n.t('toasts.addedToCart'), 'success');

        if (isAuthenticated) {
          try {
            await api.cart.add(product.id, quantity);
            // Sync with server silently in background
            await fetchCart();
          } catch (error) {
            console.error("Add to cart failed", error);
            // Revert on failure
            set({ cart: previousCart });
            addToast('Sepete eklenemedi', 'error');
          }
        } else {
          // For non-authenticated, the local state update above IS the logic.
          // We just need to persist (zustand persist handles this automatically via set)
        }
      },
      decreaseQuantity: async (id) => {
        const { isAuthenticated, cart, fetchCart } = get();
        const item = cart.find(x => x.productId === id);
        if (!item) return;

        // Optimistic update
        const previousCart = [...cart];
        let newCart = [...cart];

        if (item.quantity > 1) {
          newCart = newCart.map(i => i.productId === id ? { ...i, quantity: i.quantity - 1, subtotal: (i.product.discountPrice || i.product.price) * (i.quantity - 1) } : i);
        } else {
          newCart = newCart.filter(i => i.productId !== id);
        }
        set({ cart: newCart });

        if (isAuthenticated) {
          try {
            if (item.quantity > 1) {
              await api.cart.update(id, item.quantity - 1);
            } else {
              await api.cart.remove(id);
            }
            await fetchCart();
          } catch (error) {
            console.error(error);
            set({ cart: previousCart }); // Revert
          }
        }
      },
      removeFromCart: async (id) => {
        const { isAuthenticated, cart } = get();
        // Optimistic Update
        const previousCart = [...cart];
        set({ cart: cart.filter(item => item.productId !== id) });

        if (isAuthenticated) {
          try {
            await api.cart.remove(id);
            await get().fetchCart();
          } catch (e) {
            console.error(e);
            set({ cart: previousCart }); // Revert
          }
        }
      },
      toggleCart: (isOpen) => set((state) => ({
        isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen
      })),
      clearCart: () => set({ cart: [], couponCode: null, discountPercentage: 0 }),
      fetchCart: async () => {
        if (!get().isAuthenticated) return;
        try {
          const res = await api.cart.get() as any;
          console.log('[Store] Raw cart response:', res);

          // 3. Normalize and filter
          let validItems: any[] = [];

          if (Array.isArray(res)) {
            validItems = res;
          } else if (res.items && Array.isArray(res.items)) {
            validItems = res.items;
          }

          if (validItems.length === 0) {
            console.log('[Store] Cart appears empty from server');
            // Don't mistakenly clear if it's just a format issue, but if it's truly empty, we must search
            // However, for now, if array is empty, we assume cart is empty.
          }

          // Use a Map or filtered list to ensure robustness
          const enrichedItems = await Promise.all(validItems.map(async (item) => {
            // Robust ID extraction (productId or product_id)
            // Backend might return product object or just ID
            const pId = item.productId || item.product_id || (typeof item.product === 'string' ? item.product : item.product?.id);

            if (!pId) {
              console.warn('[Store] Skipping item without ID:', item);
              return null;
            }

            // 1. If item already has full product object, use it
            if (item.product && typeof item.product !== 'string' && item.product.id) {
              return item;
            }

            // 2. Try to fetch product, with fallback to local cache
            try {
              const product = await api.products.getById(pId);
              return {
                ...item,
                productId: pId,
                product,
                subtotal: (product.discountPrice || product.price) * (item.quantity || 1)
              };
            } catch (err) {
              console.warn(`[Store] Failed to fetch product ${pId} from API. Trying local cache.`, err);

              // Fallback: Check if we have this product in our current local cart state
              const existingItem = get().cart.find(c => c.productId === pId);
              if (existingItem && existingItem.product) {
                console.log(`[Store] Recovered product ${pId} from local cache.`);
                return {
                  ...item,
                  productId: pId,
                  product: existingItem.product,
                  subtotal: (existingItem.product.discountPrice || existingItem.product.price) * (item.quantity || 1)
                };
              }

              return null;
            }
          }));

          const finalCart = enrichedItems.filter(Boolean);
          console.log('[Store] Final cart filtered:', finalCart);
          set({ cart: finalCart });
        } catch (e) {
          console.error("Fetch cart failed", e);
        }
      },

      // Wishlist
      wishlist: [],
      fetchWishlist: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return [];
        try {
          const items = await api.wishlist.getAll();
          if (Array.isArray(items)) {
            set({
              wishlist: items.map(item => {
                // Robust ID extraction
                const anyItem = item as any;
                return item.productId || anyItem.product_id || (typeof item.product === 'string' ? item.product : item.product?.id) || '';
              }).filter(id => !!id)
            });
            return items;
          }
          return [];
        } catch (error) {
          console.error('Failed to fetch wishlist', error);
          return [];
        }
      },
      toggleWishlist: async (productId) => {
        const { isAuthenticated, wishlist } = get();
        const exists = wishlist.includes(productId);

        if (isAuthenticated) {
          try {
            if (exists) {
              await api.wishlist.remove(productId);
              set(state => ({ wishlist: state.wishlist.filter(id => id !== productId) }));
              get().addToast(i18n.t('toasts.removedFromWishlist'), 'info');
            } else {
              await api.wishlist.add(productId);
              set(state => ({ wishlist: [...state.wishlist, productId] }));
              get().addToast(i18n.t('toasts.savedToWishlist'), 'success');
            }
          } catch (error) {
            get().addToast('Favori işlemi başarısız', 'error');
          }
        } else {
          // Local logic for non-authenticated users
          set((state) => {
            const exists = state.wishlist.includes(productId);
            if (exists) {
              get().addToast(i18n.t('toasts.removedFromWishlist'), 'info');
              return { wishlist: state.wishlist.filter(id => id !== productId) };
            } else {
              get().addToast(i18n.t('toasts.savedToWishlist'), 'success');
              return { wishlist: [...state.wishlist, productId] };
            }
          });
        }
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),

      // Search
      isSearchOpen: false,
      toggleSearch: (isOpen) => set((state) => ({
        isSearchOpen: isOpen !== undefined ? isOpen : !state.isSearchOpen
      })),

      // Toasts
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }]
        }));
        // Auto dismiss
        setTimeout(() => {
          get().removeToast(id);
        }, 3000);
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),

      // Coupon Logic
      couponCode: null,
      discountPercentage: 0,
      applyCoupon: async (code) => {
        try {
          const response = await api.cart.validateCoupon(code);
          if (response && response.valid) {
            set({
              couponCode: response.code,
              discountPercentage: response.discount
            });
            get().addToast(i18n.t('toasts.couponApplied'), 'success');
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },
      removeCoupon: () => set({ couponCode: null, discountPercentage: 0 }),

      // Language
      language: 'tr',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      // Auth
      user: null,
      isAuthenticated: false,
      verifySession: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          // Verify session by fetching profile.
          // If valid, update user. If invalid (401), axios interceptor handles logout.
          const user = await api.user.getProfile();
          set({ user: { ...get().user, ...user } });
        } catch (error) {
          console.log('[Store] Session verification failed', error);
        }
      },
      orders: [],
      currentOrder: null,
      tickets: [],
      productQuestions: [],

      login: async (email, password) => {
        try {
          // CAPTURE LOCAL CART BEFORE ANY STATE CHANGES
          const localCart = get().cart;

          // 1. Login ol ve token al
          const data = await api.auth.login(email, password);

          // 2. State'i güncelle
          // Ensure addresses exists to prevent undefined errors
          const sanitizedUser = {
            ...data.user,
            addresses: data.user.addresses || []
          };


          set({
            isAuthenticated: true,
            user: sanitizedUser
          });

          // MERGE LOCAL CART TO SERVER (Sync logic)
          // We captured localCart at the start of login to avoid it being cleared by state updates
          if (localCart.length > 0) {
            try {
              // Sync items sequentially to ensure backend processes them
              await Promise.all(localCart.map(item =>
                api.cart.add(item.productId, item.quantity).catch(e => console.error('Sync cart item failed for product ' + item.productId, e))
              ));
            } catch (e) {
              console.error("Cart sync error", e);
            }
          }

          // 3. Kullanıcıya ait verileri paralel olarak çek
          const [orders, tickets, addresses, cart, wishlist, questions] = await Promise.all([
            api.orders.getAll(1, 100).then(res => res && Array.isArray(res.data) ? res.data : []).catch(() => []),
            api.tickets.getAll().then(res => res.data || []).catch(() => []),
            // Adresleri de login sonrası tazeleyelim, backend bazen login'de göndermeyebilir
            api.user.getAddresses().then(res => Array.isArray(res) ? res : []).catch(() => []),
            get().fetchCart().catch(() => []),
            get().fetchWishlist().catch(() => []),
            api.questions.getMyQuestions().then(res => res.data || []).catch(() => [])
          ]);

          // Adresleri user state'ine güncelle
          set(state => ({
            orders,
            tickets,
            productQuestions: questions,
            user: state.user ? { ...state.user, addresses: addresses.length ? addresses : (state.user.addresses || []) } : null
          }));

          get().addToast(i18n.t('toasts.welcomeBack'), 'success');
        } catch (error: any) {
          get().addToast(error.message || i18n.t('toasts.loginFailed'), 'error');
          throw error; // Hatayı fırlat ki LoginPage formda yakalayabilsin
        }
      },

      register: async (email, name, phone, password) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const user = await api.auth.register(email, name, phone, password);
          // Register sonrası otomatik login yapabilir veya login sayfasına yönlendirebilirsin.
          // Backend register'da token dönüyor mu? authController'a baktığımda dönüyor.
          // O zaman burada da login akışını işletebiliriz ama şimdilik sadece toast gösterelim.
          get().addToast(i18n.t('toasts.accountCreated'), 'success');
        } catch (error: any) {
          get().addToast(error.message || i18n.t('toasts.registrationFailed'), 'error');
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('Logout failed', error);
        }
        set({ isAuthenticated: false, user: null, orders: [], tickets: [], productQuestions: [] });
        get().addToast(i18n.t('toasts.loggedOut'), 'info');
      },
      updateProfile: async (data) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { currentPassword, newPassword, confirmPassword, ...profileData } = data;

          await api.user.updateProfile(data);

          // Şifre dışındaki bilgileri state'e yansıt (optimistic veya sunucudan dönen)
          set((state) => ({
            user: state.user ? { ...state.user, ...profileData } : null
          }));

          get().addToast(i18n.t('toasts.profileUpdated'), 'success');
        } catch (error: any) {
          get().addToast(error.message || 'Profil güncellenemedi', 'error');
          throw error;
        }
      },
      fetchProfile: async () => {
        try {
          const [user, addresses] = await Promise.all([
            api.user.getProfile(),
            api.user.getAddresses().catch(() => [])
          ]);

          if (user) {
            set({ user: { ...user, addresses: addresses && addresses.length > 0 ? addresses : (user.addresses || []) } });
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      // Orders logic
      createOrder: async (checkoutData) => {
        try {
          const response = await api.cart.checkout(checkoutData);

          // State'i güncelle
          set((state) => ({
            // Validation: Ensure response conforms to Order
            orders: [response as unknown as Order, ...state.orders],
            cart: [],
            couponCode: null,
            discountPercentage: 0
          }));

          // Re-fetch orders to be sure (async)
          api.orders.getAll().then(res => set({ orders: res.data || [] }));

          get().addToast(i18n.t('toasts.orderPlaced'), 'success');
        } catch (error: any) {
          get().addToast(error.message || 'Sipariş oluşturulamadı', 'error');
          throw error;
        }
      },
      fetchOrder: async (id) => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return null;
        try {
          const order = await api.orders.getById(id);
          set({ currentOrder: order });
          return order;
        } catch (error) {
          console.error('Failed to fetch order details', error);
          get().addToast('Sipariş detayları alınamadı', 'error');
          return null;
        }
      },
      fetchOrders: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          const res = await api.orders.getAll(1, 100);
          set({ orders: res.data || [] });
        } catch (error) {
          console.error('Failed to fetch orders', error);
        }
      },

      // Address Logic
      // Address Logic
      addAddress: async (addressData) => {
        try {
          const newAddress = await api.user.addAddress(addressData);
          set((state) => {
            if (!state.user) return {};
            return {
              user: {
                ...state.user,
                addresses: [...(state.user.addresses || []), newAddress]
              }
            };
          });
          get().addToast(i18n.t('toasts.addressAdded'), 'success');
        } catch (error: any) {
          get().addToast('Adres eklenemedi', 'error');
        }
      },
      removeAddress: async (id) => {
        try {
          await api.user.deleteAddress(id);
          set((state) => {
            if (!state.user) return {};
            return {
              user: {
                ...state.user,
                addresses: (state.user.addresses || []).filter(a => a.id !== id)
              }
            };
          });
          get().addToast(i18n.t('toasts.addressRemoved'), 'info');
        } catch (error: any) {
          get().addToast('Adres silinemedi', 'error');
        }
      },
      updateAddress: async (address) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...data } = address;
          const updatedAddress = await api.user.updateAddress(id, data);
          set((state) => {
            if (!state.user) return {};
            return {
              user: {
                ...state.user,
                addresses: (state.user.addresses || []).map(a => a.id === address.id ? updatedAddress : a)
              }
            };
          });
          get().addToast(i18n.t('toasts.addressUpdated'), 'success');
        } catch (error: any) {
          get().addToast('Adres güncellenemedi', 'error');
        }
      },

      // Support Logic
      submitTicket: async (subject, message, orderNo) => {
        try {
          const newTicket = await api.tickets.create({ subject, message, orderNo });
          set((state) => ({
            tickets: [newTicket, ...state.tickets]
          }));
          get().addToast(i18n.t('toasts.ticketSubmitted'), 'success');
        } catch (error: any) {
          get().addToast('Destek talebi oluşturulamadı', 'error');
          throw error;
        }
      },
      fetchTickets: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          const res = await api.tickets.getAll();
          set({ tickets: res.data || [] });
        } catch (error) {
          console.error('Failed to fetch tickets', error);
        }
      },

      // QA Logic
      // QA Logic
      submitProductQuestion: async (product, question) => {
        try {
          const newQ = await api.questions.ask(product.id, question);
          set((state) => ({
            productQuestions: [{ ...newQ, product }, ...state.productQuestions]
          }));
          get().addToast(i18n.t('toasts.questionSubmitted'), 'success');
        } catch (e: any) {
          get().addToast(e.message || 'Soru sorulamadı', 'error');
          throw e;
        }
      },
      fetchProductQuestions: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          const res = await api.questions.getMyQuestions();
          set({ productQuestions: res.data || [] });
        } catch (error) {
          console.error('Failed to fetch product questions', error);
        }
      },

      // Review Logic
      submitReview: async (productId, rating, comment) => {
        try {
          const review = await api.reviews.create(productId, { rating, comment });
          get().addToast(i18n.t('toasts.reviewSubmitted') || 'Yorumunuz başarıyla gönderildi', 'success');
          return review;
        } catch (error: any) {
          get().addToast(error.message || 'Yorum yapılamadı', 'error');
          throw error;
        }
      }
    }),
    {
      name: 'favilla-storage',
      storage: createJSONStorage(() => localStorage),
      // SECURITY IMPROVEMENT: Only persist non-sensitive data
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        language: state.language,
        isAuthenticated: state.isAuthenticated,
        user: state.user // User bilgisini de persist edelim
      }),
    }
  )
);

// Inject store to axiosClient to break circular dependency
import { injectStore } from './services/axiosClient';
injectStore(useStore);

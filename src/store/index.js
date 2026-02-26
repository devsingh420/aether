import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, CONFIG } from '../data/constants';
import { calculateCartTotals } from '../utils/helpers';

export const useStore = create(
  persist(
    (set, get) => ({
      // Mode: retail or wholesale
      mode: 'retail',
      setMode: (mode) => set({ mode }),

      // User auth state
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Cart (for retail mode)
      cart: [],
      addToCart: (product, quantity = 1) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.productId === product.id);

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                productId: product.id,
                product,
                quantity,
              },
            ],
          });
        }
      },
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter((item) => item.productId !== productId) });
        } else {
          set({
            cart: get().cart.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          });
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.productId !== productId) });
      },
      clearCart: () => set({ cart: [] }),

      // Inquiries (for wholesale mode)
      inquiries: [],
      addInquiry: (inquiry) => {
        set({ inquiries: [...get().inquiries, { ...inquiry, id: Date.now().toString() }] });
      },
      updateInquiry: (id, updates) => {
        set({
          inquiries: get().inquiries.map((inq) =>
            inq.id === id ? { ...inq, ...updates } : inq
          ),
        });
      },
      removeInquiry: (id) => {
        set({ inquiries: get().inquiries.filter((inq) => inq.id !== id) });
      },
      clearInquiries: () => set({ inquiries: [] }),

      // UI state
      showCart: false,
      setShowCart: (show) => set({ showCart: show }),
      showInquiries: false,
      setShowInquiries: (show) => set({ showInquiries: show }),
      showAuth: false,
      setShowAuth: (show) => set({ showAuth: show }),

      // Computed values
      getCartTotals: () => {
        const { cart, mode } = get();
        return calculateCartTotals(cart, mode);
      },

      getCartKg: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          const retailQty = item.product?.retailQty || 1;
          return total + retailQty * item.quantity;
        }, 0);
      },

      canCheckout: () => {
        const { cart, mode } = get();
        if (cart.length === 0) return false;

        if (mode === 'retail') {
          const totalKg = get().getCartKg();
          return totalKg >= CONFIG.minRetailKg;
        }

        return true;
      },
    }),
    {
      name: 'aether-store',
      partialize: (state) => ({
        mode: state.mode,
        cart: state.cart,
        inquiries: state.inquiries,
        user: state.user,
      }),
    }
  )
);

// Auth-specific store (separate for token management)
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: true,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useStore;

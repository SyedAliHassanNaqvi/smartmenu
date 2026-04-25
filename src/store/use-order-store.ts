import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  specialRequests?: string;
}

export interface OrderStore {
  tableId: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountCode: string | null;
  setTableId: (tableId: string) => void;
  addItem: (item: OrderItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, discount: number) => void;
  getTotal: () => number;
}

export const useOrderStore = create<OrderStore>()(
  devtools(
    persist(
      (set, get) => ({
        tableId: null,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        discountCode: null,

        setTableId: (tableId) => set({ tableId }),

        addItem: (item) =>
          set((state) => {
            const existingItem = state.items.find((i) => i.productId === item.productId);
            let newItems;

            if (existingItem) {
              newItems = state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              );
            } else {
              newItems = [...state.items, item];
            }

            const subtotal = newItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );
            const tax = subtotal * 0.1;

            return { items: newItems, subtotal, tax };
          }),

        removeItem: (productId) =>
          set((state) => {
            const newItems = state.items.filter((i) => i.productId !== productId);
            const subtotal = newItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );
            const tax = subtotal * 0.1;

            return { items: newItems, subtotal, tax };
          }),

        updateQuantity: (productId, quantity) =>
          set((state) => {
            const newItems =
              quantity <= 0
                ? state.items.filter((i) => i.productId !== productId)
                : state.items.map((i) =>
                    i.productId === productId ? { ...i, quantity } : i
                  );

            const subtotal = newItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );
            const tax = subtotal * 0.1;

            return { items: newItems, subtotal, tax };
          }),

        clearCart: () =>
          set({ items: [], subtotal: 0, tax: 0, discount: 0, discountCode: null }),

        applyDiscount: (code, discount) =>
          set({ discountCode: code, discount }),

        getTotal: () => {
          const { subtotal, tax, discount } = get();
          return subtotal + tax - discount;
        },
      }),
      {
        name: "order-storage",
      }
    )
  )
);

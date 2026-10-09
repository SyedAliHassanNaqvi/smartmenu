import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Diner cart + placed-order history, scoped per table.
 * `tableKey` is the table's QR code (or "restaurantId/tableNumber" for legacy links).
 * Persisted to localStorage by the store (see ./index.ts), so a refresh keeps both.
 */

export interface CartLine {
  productId: string;
  productName: string;
  /** Display price only — the server recomputes prices when the order is placed. */
  price: number;
  quantity: number;
  image?: string;
}

export interface PlacedOrderRef {
  id: string;
  placedAt: string; // ISO
}

export interface CartState {
  carts: Record<string, CartLine[]>;
  orders: Record<string, PlacedOrderRef[]>;
}

export const initialCartState: CartState = { carts: {}, orders: {} };

/** Placed orders older than this are dropped when the app loads. */
export const ORDER_HISTORY_TTL_MS = 12 * 60 * 60 * 1000;

const MAX_QUANTITY = 50;

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    /** Replace the whole slice (cross-tab sync from localStorage). */
    hydrate(_state, action: PayloadAction<CartState>) {
      return action.payload;
    },

    addItem(state, action: PayloadAction<{ tableKey: string; item: CartLine }>) {
      const { tableKey, item } = action.payload;
      const lines = (state.carts[tableKey] ??= []);
      const existing = lines.find((line) => line.productId === item.productId);
      if (existing) {
        existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
      } else {
        lines.push({ ...item, quantity: Math.min(MAX_QUANTITY, item.quantity) });
      }
    },

    setQuantity(state, action: PayloadAction<{ tableKey: string; productId: string; quantity: number }>) {
      const { tableKey, productId, quantity } = action.payload;
      const lines = state.carts[tableKey] ?? [];
      state.carts[tableKey] =
        quantity <= 0
          ? lines.filter((line) => line.productId !== productId)
          : lines.map((line) =>
              line.productId === productId ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line
            );
    },

    removeItem(state, action: PayloadAction<{ tableKey: string; productId: string }>) {
      const { tableKey, productId } = action.payload;
      state.carts[tableKey] = (state.carts[tableKey] ?? []).filter((line) => line.productId !== productId);
    },

    clearCart(state, action: PayloadAction<{ tableKey: string }>) {
      delete state.carts[action.payload.tableKey];
    },

    /** Record a successfully placed order and empty that table's cart. */
    orderPlaced(state, action: PayloadAction<{ tableKey: string; orderId: string }>) {
      const { tableKey, orderId } = action.payload;
      delete state.carts[tableKey];
      const orders = (state.orders[tableKey] ??= []);
      if (!orders.some((order) => order.id === orderId)) {
        orders.unshift({ id: orderId, placedAt: new Date().toISOString() });
      }
    },

    forgetOrder(state, action: PayloadAction<{ tableKey: string; orderId: string }>) {
      const { tableKey, orderId } = action.payload;
      state.orders[tableKey] = (state.orders[tableKey] ?? []).filter((order) => order.id !== orderId);
    },
  },
});

export const cartActions = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

/** Drop expired order references (e.g. after loading from storage). */
export function pruneCartState(state: CartState, now = Date.now()): CartState {
  const orders: CartState["orders"] = {};
  for (const [tableKey, refs] of Object.entries(state.orders ?? {})) {
    const fresh = refs.filter((ref) => now - new Date(ref.placedAt).getTime() < ORDER_HISTORY_TTL_MS);
    if (fresh.length) orders[tableKey] = fresh;
  }
  return { carts: state.carts ?? {}, orders };
}

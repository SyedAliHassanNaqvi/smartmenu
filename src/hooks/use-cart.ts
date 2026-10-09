import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { cartActions, type CartLine, type PlacedOrderRef } from "@/store/cart-slice";
import { roundMoney } from "@/lib/order-status";
import { DEFAULT_TAX_RATE } from "@/lib/constants";

const EMPTY_LINES: CartLine[] = [];
const EMPTY_ORDERS: PlacedOrderRef[] = [];

/**
 * Cart for one table (Redux, persisted). Totals here are an estimate for
 * display; the server computes the authoritative amounts when ordering.
 *
 * @param tableKey the table's QR code (or legacy restaurantId/tableNumber key)
 * @param taxRate  the restaurant's tax rate, e.g. 0.22
 */
export function useCart(tableKey: string, taxRate: number = DEFAULT_TAX_RATE) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.carts[tableKey] ?? EMPTY_LINES);
  const placedOrders = useAppSelector((state) => state.cart.orders[tableKey] ?? EMPTY_ORDERS);

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const tax = roundMoney(subtotal * taxRate);
    return { itemCount, subtotal, tax, total: roundMoney(subtotal + tax) };
  }, [items, taxRate]);

  const addToCart = useCallback(
    (productId: string, productName: string, price: number, quantity = 1, image?: string) =>
      dispatch(cartActions.addItem({ tableKey, item: { productId, productName, price, quantity, image } })),
    [dispatch, tableKey]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch(cartActions.setQuantity({ tableKey, productId, quantity })),
    [dispatch, tableKey]
  );

  const removeFromCart = useCallback(
    (productId: string) => dispatch(cartActions.removeItem({ tableKey, productId })),
    [dispatch, tableKey]
  );

  const clearCart = useCallback(() => dispatch(cartActions.clearCart({ tableKey })), [dispatch, tableKey]);

  /** Record a placed order for this table and empty the cart. */
  const markOrderPlaced = useCallback(
    (orderId: string) => dispatch(cartActions.orderPlaced({ tableKey, orderId })),
    [dispatch, tableKey]
  );

  const forgetOrder = useCallback(
    (orderId: string) => dispatch(cartActions.forgetOrder({ tableKey, orderId })),
    [dispatch, tableKey]
  );

  return {
    items,
    ...totals,
    taxRate,
    placedOrders,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    markOrderPlaced,
    forgetOrder,
  };
}

import { useCallback } from "react";
import { useOrderStore } from "@/store/use-order-store";

export function useCart() {
  const {
    items,
    subtotal,
    tax,
    discount,
    discountCode,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    getTotal,
  } = useOrderStore();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotal();

  const addToCart = useCallback(
    (productId: string, productName: string, price: number, quantity = 1) => {
      addItem({
        productId,
        productName,
        price,
        quantity,
      });
    },
    [addItem]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      removeItem(productId);
    },
    [removeItem]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(productId, quantity);
    },
    [updateQuantity]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      // Mock coupon validation
      const discounts: Record<string, number> = {
        WELCOME10: subtotal * 0.1,
        SAVE20: subtotal * 0.2,
      };

      const discountAmount = discounts[code] || 0;
      if (discountAmount > 0) {
        applyDiscount(code, discountAmount);
        return true;
      }
      return false;
    },
    [subtotal, applyDiscount]
  );

  return {
    items,
    itemCount,
    subtotal,
    tax,
    discount,
    discountCode,
    total,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    applyCoupon,
    clearCart,
  };
}

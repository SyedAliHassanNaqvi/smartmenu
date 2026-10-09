import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { cartActions, cartReducer, initialCartState, pruneCartState, type CartState } from "./cart-slice";

/**
 * Redux store (cart). One store per browser tab, created by <StoreProvider>.
 * The cart slice is loaded from and saved to localStorage so it survives refreshes.
 */

const STORAGE_KEY = "visiondine-cart-v2";

function loadCartState(): CartState {
  if (typeof window === "undefined") return initialCartState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? pruneCartState(JSON.parse(raw) as CartState) : initialCartState;
  } catch {
    return initialCartState;
  }
}

export function makeStore() {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: loadCartState() },
  });

  if (typeof window !== "undefined") {
    let saved = store.getState().cart;
    store.subscribe(() => {
      const cart = store.getState().cart;
      if (cart === saved) return;
      saved = cart;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {
        // Storage full or blocked (private mode) — the cart still works in memory.
      }
    });

    // Keep carts in sync across tabs of the same browser.
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        store.dispatch(cartActions.hydrate(loadCartState()));
      }
    });
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

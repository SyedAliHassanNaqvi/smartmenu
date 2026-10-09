/**
 * Order lifecycle rules shared by the API (validation) and the admin UI (buttons).
 * Safe to import from client components — no server-only dependencies.
 */
export const ORDER_FLOW = ["placed", "confirmed", "preparing", "ready", "served", "completed"] as const;

export type OrderStatus = (typeof ORDER_FLOW)[number] | "cancelled";

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["placed", "confirmed", "preparing", "ready"];
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["completed", "cancelled"];

const CANCELLABLE: OrderStatus[] = ["placed", "confirmed", "preparing", "ready"];

/**
 * An order may move forward along ORDER_FLOW (skipping steps is allowed, e.g.
 * placed → ready), or be cancelled before it is served. Terminal states never change.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to || TERMINAL_ORDER_STATUSES.includes(from)) return false;
  if (to === "cancelled") return CANCELLABLE.includes(from);

  const fromIndex = ORDER_FLOW.indexOf(from as (typeof ORDER_FLOW)[number]);
  const toIndex = ORDER_FLOW.indexOf(to as (typeof ORDER_FLOW)[number]);
  return fromIndex !== -1 && toIndex > fromIndex;
}

/** The single next step in the normal flow, or null for terminal states. */
export function nextOrderStatus(from: OrderStatus): OrderStatus | null {
  if (TERMINAL_ORDER_STATUSES.includes(from)) return null;
  const index = ORDER_FLOW.indexOf(from as (typeof ORDER_FLOW)[number]);
  return index === -1 ? null : ORDER_FLOW[index + 1] ?? null;
}

/** Human-friendly label for the button that moves an order to `status`. */
export const ORDER_ACTION_LABELS: Record<OrderStatus, string> = {
  placed: "Place",
  confirmed: "Accept",
  preparing: "Start preparing",
  ready: "Mark ready",
  served: "Mark served",
  completed: "Complete",
  cancelled: "Cancel",
};

/** Round a money amount to 2 decimals. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

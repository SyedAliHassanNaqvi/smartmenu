/**
 * Centralized TanStack Query key factories. Keeping query keys here avoids
 * key-drift between components and makes cache invalidation predictable.
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    byRestaurant: (restaurantId: string) =>
      ["products", "restaurant", restaurantId] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters: string) => ["orders", "list", filters] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  tables: {
    all: ["tables"] as const,
    resolve: (code: string) => ["tables", "resolve", code] as const,
    info: (restaurantId: string, tableNumber: number) =>
      ["tables", "info", restaurantId, tableNumber] as const,
  },
  restaurant: {
    current: ["restaurant", "current"] as const,
  },
  qrCodes: {
    all: ["qr-codes"] as const,
  },
  invitations: {
    validate: (token: string) => ["invitations", "validate", token] as const,
  },
};

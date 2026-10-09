/**
 * Shapes returned by public (diner-facing) API routes. Safe for client imports.
 */
export interface PublicRestaurant {
  _id: string;
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  theme?: { primaryColor?: string; secondaryColor?: string };
}

export interface PublicTable {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: string;
  location?: string;
  restaurantId: string;
  code?: string;
}

export interface PublicOrder {
  _id: string;
  tableNumber: number;
  status: "placed" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  items: { productName: string; quantity: number; price: number }[];
  itemCount: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus?: string;
  estimatedTime?: number;
  readyBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

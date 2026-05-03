import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: "appetizer" | "main" | "dessert" | "beverage" | "special";
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  vegetarian: boolean;
  vegan: boolean;
  calories?: number;
  rating: number;
  reviewCount: number;
  restaurantId: string; // Multi-tenancy: every product belongs to a restaurant
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  specialRequests?: string;
  status: "pending" | "preparing" | "ready" | "served";
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  restaurantId: string; // Multi-tenancy: every order belongs to a restaurant
  tableId: string;
  tableNumber: number;
  items: IOrderItem[];
  status: "placed" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  discountCode?: string;
  paymentMethod?: "cash" | "card" | "mobile" | "wallet";
  paymentStatus: "pending" | "paid" | "failed";
  specialRequests?: string;
  estimatedTime?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ITable extends Document {
  _id: Types.ObjectId;
  restaurantId: string; // Multi-tenancy: every table belongs to a restaurant
  tableNumber: number;
  capacity: number;
  location?: string;
  status: "available" | "occupied" | "reserved" | "maintenance";
  qrCode?: string;
  currentGuests: number;
  activeOrder?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: "admin" | "staff" | "customer";
  restaurantId?: string; // Multi-tenancy: admin/staff users belong to a restaurant
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

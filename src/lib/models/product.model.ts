import mongoose from "mongoose";
import { IProduct } from "@/types/models";

const productSchema = new mongoose.Schema<IProduct>(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true, // Multi-tenancy: every product belongs to a restaurant
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      enum: ["appetizer", "main", "dessert", "beverage", "special"],
      required: true,
    },
    image: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      required: true,
      min: [1, "Preparation time must be at least 1 minute"],
    },
    ingredients: [String],
    allergens: [String],
    vegetarian: {
      type: Boolean,
      default: false,
    },
    vegan: {
      type: Boolean,
      default: false,
    },
    calories: Number,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient multi-tenant queries
productSchema.index({ restaurantId: 1, category: 1 });
productSchema.index({ restaurantId: 1, isAvailable: 1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

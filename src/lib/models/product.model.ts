import mongoose from "mongoose";
import { defineModel } from "./define-model";
import { IProduct } from "@/types/models";
import { MAX_GALLERY_IMAGES, MODEL3D_STATUSES } from "@/lib/media-rules";

const mediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    bytes: Number,
    format: String,
    duration: Number,
  },
  { _id: false }
);

const model3dSchema = new mongoose.Schema(
  {
    status: { type: String, enum: MODEL3D_STATUSES, default: "none" },
    source: { type: String, enum: ["pipeline", "manual"] },
    glbUrl: String,
    posterUrl: String,
    publicId: String,
    error: String,
    updatedAt: Date,
  },
  { _id: false }
);

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
    gallery: {
      type: [mediaAssetSchema],
      default: [],
      validate: {
        validator: (value: unknown[]) => value.length <= MAX_GALLERY_IMAGES,
        message: `A product can have at most ${MAX_GALLERY_IMAGES} gallery images`,
      },
    },
    video: mediaAssetSchema,
    model3d: {
      type: model3dSchema,
      default: () => ({ status: "none" }),
    },
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

export const Product = defineModel<IProduct>("Product", productSchema);

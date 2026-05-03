import mongoose from "mongoose";

export interface IRestaurant {
  _id?: string;
  name: string;
  ownerEmail: string;
  ownerName: string;
  address?: string;
  phone?: string;
  description?: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
    taxRate: number;
  };
  subscription: {
    plan: "free" | "basic" | "premium";
    status: "active" | "inactive" | "suspended";
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new mongoose.Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
    },
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    address: String,
    phone: String,
    description: String,
    logo: String,
    theme: {
      primaryColor: {
        type: String,
        default: "#4F46E5",
      },
      secondaryColor: {
        type: String,
        default: "#7C3AED",
      },
    },
    settings: {
      currency: {
        type: String,
        default: "EUR",
      },
      timezone: {
        type: String,
        default: "Europe/Rome",
      },
      language: {
        type: String,
        default: "en",
      },
      taxRate: {
        type: Number,
        default: 0.22, // 22% Italian VAT
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active",
      },
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
restaurantSchema.index({ ownerEmail: 1 });
restaurantSchema.index({ "subscription.status": 1 });

export const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", restaurantSchema);
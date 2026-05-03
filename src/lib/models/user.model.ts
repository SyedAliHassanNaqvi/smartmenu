import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "staff" | "customer";
  restaurantId: string; // Multi-tenancy: every user belongs to a restaurant
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "customer"],
      default: "customer",
    },
    restaurantId: {
      type: String,
      required: true,
      index: true, // For efficient multi-tenant queries
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient lookups
userSchema.index({ email: 1, restaurantId: 1 }, { unique: true }); // Email unique per restaurant
userSchema.index({ restaurantId: 1, role: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
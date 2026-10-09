import mongoose from "mongoose";

/**
 * Register a Mongoose model safely across Next.js hot reloads.
 *
 * In development, an edited schema file is re-evaluated but Mongoose still
 * holds the old model, so the new fields/enums are silently ignored (e.g. a
 * new enum value fails validation). Re-registering in dev keeps the schema in
 * sync; in production the cached model is reused.
 */
export function defineModel<T>(name: string, schema: mongoose.Schema<T>) {
  if (mongoose.models[name]) {
    if (process.env.NODE_ENV === "production") {
      return mongoose.models[name] as mongoose.Model<T>;
    }
    mongoose.deleteModel(name);
  }
  return mongoose.model<T>(name, schema);
}

import mongoose from "mongoose";
import { serverEnv } from "./env";

const connectionOptions = {
  dbName: serverEnv.DB_NAME,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
};

const globalForMongoose = globalThis as unknown as {
  mongooseConnection?: mongoose.Mongoose;
  mongoosePromise?: Promise<mongoose.Mongoose>;
};

export async function dbConnect(): Promise<mongoose.Mongoose> {
  if (globalForMongoose.mongooseConnection) {
    return globalForMongoose.mongooseConnection;
  }

  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(
      serverEnv.MONGODB_URI,
      connectionOptions,
    );
  }

  try {
    globalForMongoose.mongooseConnection = await globalForMongoose.mongoosePromise;
  } catch (err) {
    // Critical: clear the cached promise on failure so the NEXT call
    // retries fresh instead of re-awaiting this same dead rejected promise.
    globalForMongoose.mongoosePromise = undefined;
    throw err;
  }

  return globalForMongoose.mongooseConnection;
}
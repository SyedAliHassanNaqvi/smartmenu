import mongoose from "mongoose";

interface ConnectionObject {
  isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Create a promise that rejects after 10 seconds (tolerant of slow connections)
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 10000)
    );

    // Race between connection and timeout
    await Promise.race([
      mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME || "smartmenu",
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      }),
      timeoutPromise,
    ]);

    const db = mongoose.connection;
    connection.isConnected = db.readyState;
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to database", error);
    throw error;
  }
}

export default dbConnect;

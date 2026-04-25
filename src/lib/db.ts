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

    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "smartmenu",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to database", error);
    process.exit(1);
  }
}

export default dbConnect;

import mongoose from "mongoose";
import { autoSeedIfEmpty } from "./autoSeed";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (
    cached.conn &&
    mongoose.connection.readyState === 1
  ) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    cached.promise = (async () => {
      if (
        uri &&
        !uri.includes("your-user") &&
        !uri.includes("your-cluster")
      ) {
        try {
          const conn = await mongoose.connect(uri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
          });

          await autoSeedIfEmpty();

          return conn;
        } catch (err) {
          console.warn(
            "⚠️ Failed to connect to MONGODB_URI, falling back to local memory server:",
            err
          );
        }
      }

      try {
        const { MongoMemoryServer } = await import(
          "mongodb-memory-server"
        );

        const memServer =
          await MongoMemoryServer.create();

        const memUri = memServer.getUri();

        console.log(
          "🚀 Connected to in-memory MongoDB:",
          memUri
        );

        const conn = await mongoose.connect(memUri, {
          bufferCommands: false,
        });

        await autoSeedIfEmpty();

        return conn;
      } catch (memErr) {
        console.error(
          "❌ Failed to start in-memory MongoDB server:",
          memErr
        );

        throw new Error(
          "Could not establish MongoDB connection"
        );
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
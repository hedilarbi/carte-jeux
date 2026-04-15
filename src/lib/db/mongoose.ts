import mongoose from "mongoose";

function getMongoUri() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  return mongodbUri;
}

function getMongoDbName() {
  const dbName = process.env.MONGODB_DB_NAME?.trim();

  if (!dbName) {
    return undefined;
  }

  if (/[\\/]/.test(dbName)) {
    throw new Error(
      "MONGODB_DB_NAME contains invalid characters. Remove any trailing slash or backslash.",
    );
  }

  return dbName;
}

declare global {
  var __mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const globalCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

global.__mongooseCache = globalCache;

mongoose.set("strictQuery", true);

export async function connectToDatabase() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(getMongoUri(), {
      dbName: getMongoDbName(),
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== "production",
    });
  }

  globalCache.conn = await globalCache.promise;

  return globalCache.conn;
}

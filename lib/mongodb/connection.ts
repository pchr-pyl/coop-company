import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Connection Configuration
// ─────────────────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coop-map';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type for Next.js hot reload
declare global {
  var mongoose: MongooseCache;
}

// Initialize cache
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection Function (Singleton Pattern)
// ─────────────────────────────────────────────────────────────────────────────

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise (prevents multiple simultaneous connections)
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Use IPv4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectToDatabase;

// Models/db.js
const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

if (!mongo_url) {
    console.error('MONGO_CONN environment variable is not defined');
    process.exit(1);
}

// Connection options optimized for Vercel serverless
const connectionOptions = {
    serverSelectionTimeoutMS: 5000, // Reduced from default 30000ms
    socketTimeoutMS: 45000,
    bufferCommands: false, // Disable mongoose buffering for serverless
    // bufferMaxEntries: 0, // REMOVED - This option is not supported in newer Mongoose versions
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maximum number of connections in the connection pool
    minPoolSize: 5, // Minimum number of connections in the connection pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionRetryFreq: 2000, // How often to retry server selection
};

// Global connection cache for serverless
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        console.log('Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('Creating new database connection...');
        
        cached.promise = mongoose.connect(mongo_url, connectionOptions).then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection failed:', e.message);
        throw e;
    }

    return cached.conn;
}

// Export the connection function
module.exports = connectToDatabase;

// For backwards compatibility, also connect immediately in non-Vercel environments
if (!process.env.VERCEL) {
    connectToDatabase().catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
}
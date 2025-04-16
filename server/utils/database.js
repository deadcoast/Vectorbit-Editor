
import mongoose from "mongoose";

/**
 * Function to establish a connection with MongoDB.
 * Includes robust error handling, retry logic, and performance optimizations.
 */
const connectDB = async () => {
  const maxRetries = 5; // Maximum number of connection retries
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        autoIndex: true, // Automatically create indexes for models
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000, // Timeout for socket connections
        maxPoolSize: 10, // Connection pool size
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries += 1;
      console.error(
        `❌ MongoDB Connection Failed (Attempt ${retries}/${maxRetries}): ${error.message}`
      );

      if (retries >= maxRetries) {
        console.error("❌ Max connection retries reached. Exiting...");
        process.exit(1); // Exit the application on failure
      }

      console.log("🔄 Retrying connection in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
    }
  }
};

/**
 * Function to gracefully close the MongoDB connection.
 * Useful for handling app termination or server restarts.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB Connection Closed");
  } catch (error) {
    console.error(`❌ Error Closing MongoDB Connection: ${error.message}`);
  }
};

/**
 * MongoDB Event Listeners
 * Logs important connection events for better observability.
 */
mongoose.connection.on("connected", () => {
  console.log("⚡️ MongoDB connection established.");
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB connection disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB connection reestablished.");
});

/**
 * Graceful Shutdown
 * Handles app termination signals to close MongoDB connection cleanly.
 */
const handleShutdown = () => {
  process.on("SIGINT", async () => {
    console.log("🚦 SIGINT received. Closing MongoDB connection...");
    await disconnectDB();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("🚦 SIGTERM received. Closing MongoDB connection...");
    await disconnectDB();
    process.exit(0);
  });
};

// Initialize shutdown handlers
handleShutdown();

export default connectDB;

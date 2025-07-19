import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`
    );
    if (connectionInstance) {
      console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } else {
      console.error("MongoDB connection failed");
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

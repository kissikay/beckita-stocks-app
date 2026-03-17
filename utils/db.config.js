import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        mongoose.set("bufferCommands", false); // Important for Render: don't hang if DB is down
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.error("FATAL: MONGO_URI is not defined in environment variables.");
            return;
        }

        console.log("Attempting to connect to MongoDB...");
        const conn = await mongoose.connect(mongoURI, {
            dbName: "stock-management-db",
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
    }
};

export default connectDB;

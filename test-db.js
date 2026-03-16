import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    try {
        console.log("Testing connection to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "stock-management-db"
        });
        console.log("Connection successful!");
        process.exit(0);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
};

testConnection();

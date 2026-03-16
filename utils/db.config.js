import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/stock-management-db";
        const conn = await mongoose.connect(mongoURI, {
            dbName: "stock-management-db"
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Don't exit — let Render keep the server alive and retry
    }
};

export default connectDB;

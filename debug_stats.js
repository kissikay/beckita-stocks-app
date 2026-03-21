import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/order.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "stock-management-db"
        });
        console.log("Connected to MongoDB (stock-management-db)");
        
        const allOrders = await Order.find();
        console.log("Total Orders found:", allOrders.length);
        
        const overallSales = allOrders.reduce((sum, o) => {
            console.log(`Order ID: ${o.id}, totalPrice: ${o.totalPrice} (type: ${typeof o.totalPrice})`);
            return sum + (Number(o.totalPrice) || 0);
        }, 0);
        
        const overallProfit = allOrders.reduce((sum, o) => sum + (Number(o.totalProfit) || 0), 0);
        
        console.log("Calculated Overall Sales:", overallSales);
        console.log("Calculated Overall Profit:", overallProfit);
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

connectDB();

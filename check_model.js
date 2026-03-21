import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/order.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "stock-management-db" });
        
        console.log("Model Name:", Order.modelName);
        console.log("Collection Name:", Order.collection.name);
        
        const count = await Order.countDocuments();
        console.log("Model countDocuments:", count);
        
        const overallResults = await Order.aggregate([
            { $group: {
                _id: null,
                overallSales: { $sum: "$totalPrice" },
                overallProfit: { $sum: "$totalProfit" },
                count: { $sum: 1 }
            }}
        ]);
        
        console.log("Aggregate Result:", JSON.stringify(overallResults, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

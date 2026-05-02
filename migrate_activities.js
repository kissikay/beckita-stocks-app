import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./utils/db.config.js";
import Order from "./models/order.js";
import Activity from "./models/activity.js";

dotenv.config();

async function migrateExistingData() {
    try {
        await connectDB();
        console.log("Starting migration of existing orders to Activity log...");

        const orders = await Order.find().sort({ createdAt: 1 });
        console.log(`Found ${orders.length} orders to migrate.`);

        for (const order of orders) {
            // Check if activity already exists for this order to avoid duplicates if script is re-run
            const exists = await Activity.findOne({ "metadata.orderId": order._id });
            if (exists) continue;

            const activity = new Activity({
                adminId: order.soldBy,
                actionType: "SALE",
                description: `Historical Sale: Order #${order.id} (Total: $${order.totalPrice.toFixed(2)})`,
                metadata: { orderId: order._id, totalPrice: order.totalPrice },
                createdAt: order.createdAt // Maintain original timestamp
            });
            await activity.save();
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrateExistingData();

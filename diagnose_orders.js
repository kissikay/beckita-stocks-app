import mongoose from 'mongoose';
import Order from './models/order.js';
import connectDB from './utils/db.config.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkOrders() {
    await connectDB();
    try {
        const count = await Order.countDocuments();
        console.log(`Total Orders: ${count}`);
        
        const latest = await Order.find().sort({ _id: -1 }).limit(5);
        latest.forEach((o, i) => {
            console.log(`Order ${i}: id=${o.id}, date=${o.date}, createdAt=${o.createdAt}, totalPrice=${o.totalPrice}, totalProfit=${o.totalProfit}`);
        });

        // Check daily query
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const dailyCount = await Order.countDocuments({ createdAt: { $gte: startDate } });
        console.log(`Orders today (createdAt): ${dailyCount}`);
        
        const dailyCountDate = await Order.countDocuments({ date: { $gte: startDate } });
        console.log(`Orders today (date field): ${dailyCountDate}`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

checkOrders();

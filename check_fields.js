import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "stock-management-db" });
        const orders = await mongoose.connection.db.collection('orders').find().limit(1).toArray();
        console.log("Sample Order:", JSON.stringify(orders[0], null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

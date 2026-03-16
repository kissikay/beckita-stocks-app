import mongoose from "mongoose";
import Admin from "./models/admin.js";
import connectDB from "./utils/db.config.js";
import dotenv from "dotenv";

dotenv.config();

const seedSuperAdmin = async () => {
    await connectDB();
    try {
        const existing = await Admin.findOne({ role: "super_admin" });
        if (!existing) {
            const superAdmin = new Admin({
                fullName: "Kissi Stanley Kofi",
                email: "stanleykissi7@gmail.com",
                password: "badger279", 
                role: "super_admin",
                status: "approved"
            });
            await superAdmin.save();
            console.log("Super Admin 'Kissi Stanley Kofi' seeded successfully!");
        } else {
            console.log("Super Admin already exists. Updating password to ensure hashing...");
            existing.password = "badger279"; // Will be hashed by pre-save hook
            await existing.save();
            console.log("Super Admin password updated successfully!");
        }
    } catch (error) {
        console.error("Error seeding Super Admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedSuperAdmin();

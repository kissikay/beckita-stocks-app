import mongoose from "mongoose";
import Admin from "./models/admin.js";
import connectDB from "./utils/db.config.js";

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
            console.log("Super Admin already exists.");
        }
    } catch (error) {
        console.error("Error seeding Super Admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedSuperAdmin();

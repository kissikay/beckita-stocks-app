import Admin from "../models/admin.js";
import Order from "../models/order.js";
import jwt from "jsonwebtoken";
import { cloudinary } from "../utils/cloudinary.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_vibrant_secret_key";

export const register = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already registered" });

        const newAdmin = new Admin({
            fullName,
            email,
            password, // In production, hash this!
            role: "admin",
            status: "pending"
        });

        await newAdmin.save();
        res.status(201).json({ message: "Registration successful. Please wait for Super Admin approval." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ "error": "All fields are required" });
        }

        const user = await Admin.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ "error": "Invalid email or password" });
        }

        if (user.status !== "approved" && user.role !== "super_admin") {
            return res.status(403).json({ "error": "Your account is pending approval from the Super Admin." });
        }

        const token = jwt.sign(
            { id: user._id, fullName: user.fullName, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        res.status(200).json({ 
            "message": "Login successful",
            "user": { "fullName": user.fullName, "role": user.role } 
        });
        
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ "error": "Internal server error: " + e.message });
    }
};

export const getPendingAdmins = async (req, res) => {
    try {
        const pending = await Admin.find({ status: "pending" });
        res.status(200).json(pending);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const approveAdmin = async (req, res) => {
    const { adminId } = req.body;
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ error: "Only Super Admin can approve accounts" });
        }

        const admin = await Admin.findByIdAndUpdate(adminId, { status: "approved" }, { new: true });
        if (!admin) return res.status(404).json({ error: "Admin not found" });

        res.status(200).json({ message: `Admin ${admin.fullName} approved successfully` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await Admin.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const updates = {};
        if (fullName) updates.fullName = fullName;
        if (email) updates.email = email;

        if (req.file) {
            console.log("Cloudinary Upload Success:", req.file);
            updates.profileImage = req.file.path; // Multer-storage-cloudinary provides the secure_url in .path
        }

        const user = await Admin.findByIdAndUpdate(req.user.id, updates, { new: true });
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: { fullName: user.fullName, email: user.email, profileImage: user.profileImage } 
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getAdminsSummary = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const admins = await Admin.find({ role: "admin", status: "approved" }).select("-password");
        
        const summary = await Promise.all(admins.map(async (admin) => {
            const stats = await Order.aggregate([
                { $match: { soldBy: admin._id } },
                { $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalPrice" },
                    totalProfit: { $sum: "$totalProfit" }
                }}
            ]);

            const adminStats = stats.length > 0 ? stats[0] : { totalOrders: 0, totalSales: 0, totalProfit: 0 };
            
            return {
                ...admin.toObject(),
                ...adminStats
            };
        }));

        res.status(200).json(summary);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
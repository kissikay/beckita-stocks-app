import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.config.js";
import Admin from "./models/admin.js";
import { login, register, getPendingAdmins, approveAdmin, getProfile, updateProfile } from "./controllers/admin.js";
import { upload } from "./utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { createProduct, restockProduct, getProducts } from "./controllers/product.js";
import { createOrder, getInsights } from "./controllers/order.js";
import { verifyToken } from "./middleware/auth.js";

const JWT_SECRET = "your_vibrant_secret_key";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Middleware to make user info available in all views
app.use(async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const fullUser = await Admin.findById(decoded.id);
            res.locals.user = fullUser;
            if (fullUser) {
                console.log(`[Middleware] User: ${fullUser.fullName}, Image: ${fullUser.profileImage || 'None'}`);
            }
        } catch (e) {
            console.error("[Middleware] Auth Error:", e.message);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// Database
connectDB();

// API Routes
app.post("/api/admin/register", register);
app.post("/api/admin/login", login);

// Protected Admin Approval Routes
app.get("/api/admin/pending", verifyToken, getPendingAdmins);
app.post("/api/admin/approve", verifyToken, approveAdmin);

// Profile Routes
app.get("/api/admin/profile", verifyToken, getProfile);
app.put("/api/admin/profile", verifyToken, upload.single('profileImage'), updateProfile);

// Protected API Routes
app.post("/api/products", verifyToken, createProduct);
app.put("/api/products/restock", verifyToken, restockProduct);
app.get("/api/products", verifyToken, getProducts);

app.post("/api/orders", verifyToken, createOrder);
app.get("/api/insights", verifyToken, getInsights);

// View Routes
app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("user")); 
app.get("/register", (req, res) => res.render("register")); // New register view
app.get("/inventory", verifyToken, (req, res) => res.render("admin")); 
app.get("/sales", verifyToken, (req, res) => res.render("order")); 
app.get("/analytics", verifyToken, (req, res) => res.render("analytics"));
app.get("/approvals", verifyToken, (req, res) => res.render("approvals")); // New approvals view
app.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await Admin.findById(req.user.id);
        res.render("profile", { user });
    } catch (e) {
        res.redirect("/login");
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_vibrant_secret_key";

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.redirect('/login');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

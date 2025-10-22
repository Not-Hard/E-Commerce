import jwt from 'jsonwebtoken';
import  User  from '../models/userModel.js';


// Middleware to protect routes and ensure the user is authenticated before accessing certain endpoints
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies["jwt-netflix"];

        if(!token) {
            return res.status(401).json({success: false, message: "Unauthorized: No token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({success: false, message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(401).json({success: false, message: "User not found" });
        }   

        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        return res.status(500).json({success: false, message: "Server error" });

    }
};


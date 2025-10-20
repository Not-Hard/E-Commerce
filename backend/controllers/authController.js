import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { redis } from "../library/redis.js";

{/*The access token is used to access protected routes (like fetching user data).
The refresh token is used to generate new access tokens after the first one expires — without asking the user to log in again.
This is more secure than having one long-lasting token.*/}
const generateToken = (userId) => {
    const accesstoken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    })

    const refreshtoken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    })

    return {accesstoken, refreshtoken};
}


//Saves the user’s refresh token in Redis (a fast in-memory database).
//Storing refresh tokens in Redis lets the backend invalidate them later more easily than relied on JWT expiration (e.g., on logout)
const storeRefreshToken = async (userId, refreshtoken) => {
    await redis.set(`refreshToken:${userId}`, refreshtoken, "EX", 7 * 24 * 60 * 60); // 7 days expiration
}

//Instead of storing tokens in localStorage (which is insecure), they’re kept safely in cookies.
const setCookie = (res, accesstoken, refreshtoken) => {
    res.cookie("accessToken", accesstoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict",// prevent CSRF attacks
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict",// prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}


export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = await User.create({ name, email, password });

        //Once user is successfully authenticated 
        const { accesstoken, refreshtoken } = generateToken(newUser._id);
        await storeRefreshToken(newUser._id, refreshtoken);

        setCookie(res, accesstoken, refreshtoken);
 
        res.status(201).json({ user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        }, message: "User registered successfully" });
    } catch (error) {  
        console.error("Error in signup controller:", error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email });
        
        if(user && (await user.comparePassword(password))) {
            const { accesstoken, refreshtoken } = generateToken(user._id);
        
            await storeRefreshToken(user._id, refreshtoken);
            setCookie(res, accesstoken, refreshtoken);

            res.status(200).json({ user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, message: "Logged in successfully" }); 
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken) {
            // Verify the refresh token to get the user ID
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" }); 
        
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(500).json({ message: error.message });
    }
};
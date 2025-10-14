import mongoose from "mongoose";


//Connect DB
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

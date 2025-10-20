import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import authRoute from './routes/authRoute.js'; 
import { connectDB } from './library/database.js';
 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
    console.log("Server ready in: http://localhost:"+PORT);
    connectDB();
}) 
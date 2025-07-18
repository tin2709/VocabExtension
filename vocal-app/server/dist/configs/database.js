import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env file');
}
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected!');
    }
    catch (error) {
        console.error('❌ MongoDB Connection Failed!', error);
        process.exit(1);
    }
};

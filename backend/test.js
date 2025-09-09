import mongodb from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Database connection error:', error);
    }
}


connectDb();
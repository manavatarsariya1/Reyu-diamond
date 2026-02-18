import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { logService } from '../services/log.service.js';

dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('MongoDB connected successfully');
    } catch (error: any) {
        console.error('MongoDB connection failed:', error.message);
        await logService.createSystemLog({
            eventType: "DATABASE_ERROR",
            targetId: null as any,
            severity: "ERROR",
            message: `MongoDB connection failed: ${error.message}`,
            meta: {
                error: error.message,
                source: "server_startup"
            }
        });
        process.exit(1);
    }
};
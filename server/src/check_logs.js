import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const SystemLogSchema = new mongoose.Schema({
    eventType: String,
    severity: String,
    message: String,
    meta: mongoose.Schema.Types.Mixed,
    createdAt: Date
}, { collection: 'systemlogs', timestamps: false });

const SystemLog = mongoose.model('SystemLogCheck', SystemLogSchema);

async function checkLogs() {
    try {
        console.log('Connecting to MongoDB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const logs = await SystemLog.find({ 
            $or: [
                { eventType: 'WEBHOOK_ERROR' },
                { eventType: 'PAYMENT_HELD' },
                { eventType: 'SYSTEM_EXCEPTION' }
            ]
        }).sort({ createdAt: -1 }).limit(10);

        console.log('Recent Relevant Logs:');
        console.log(JSON.stringify(logs, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkLogs();

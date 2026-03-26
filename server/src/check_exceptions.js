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

const SystemLog = mongoose.model('SystemLogExceptionCheck', SystemLogSchema);

async function checkExceptions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const logs = await SystemLog.find({ eventType: 'SYSTEM_EXCEPTION' })
            .sort({ createdAt: -1 })
            .limit(5);

        console.log('--- RECENT SYSTEM EXCEPTIONS ---');
        logs.forEach(log => {
            console.log(`[${log.createdAt}] MESSAGE: ${log.message}`);
            if (log.meta) {
                console.log(`META:`, JSON.stringify(log.meta, null, 2));
            }
            console.log('----------------------------');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkExceptions();

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const EscrowSchema = new mongoose.Schema({
    deal: mongoose.Schema.Types.ObjectId,
    status: String,
    paymentIntentId: String,
}, { collection: 'escrows', strict: false });

const Escrow = mongoose.model('EscrowCheck', EscrowSchema);

const dealId = '69c3b86319e018ef680fc9d4';

async function checkEscrows() {
    try {
        console.log('Connecting to MongoDB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const escrows = await Escrow.find({ deal: dealId });

        console.log(`Found ${escrows.length} escrows for deal ${dealId}:`);
        console.log(JSON.stringify(escrows, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkEscrows();

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
    email: String,
    stripeAccountId: String,
}, { collection: 'users', strict: false });

const User = mongoose.model('UserCheck', UserSchema);

const sellerId = '69a12d14355cc3b50142b4e7';

async function checkSeller() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const seller = await User.findById(sellerId);

        console.log('--- SELLER INFO ---');
        console.log(`ID: ${seller._id}`);
        console.log(`Email: ${seller.email}`);
        console.log(`Stripe Account ID: ${seller.stripeAccountId}`);
        console.log('-------------------');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSeller();

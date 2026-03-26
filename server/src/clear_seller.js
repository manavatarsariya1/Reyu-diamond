import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({}, { collection: 'users', strict: false });
const User = mongoose.model('UserClear', UserSchema);

async function clearSeller() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateOne(
            { _id: new mongoose.Types.ObjectId("69a12d14355cc3b50142b4e7") },
            { $set: { stripeAccountId: null } }
        );
        console.log("Result:", result);
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

clearSeller();

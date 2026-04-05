import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/webmeta?authSource=admin';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, name: String }));
    const users = await User.find({});
    console.log('\n--- Current Users in DB ---');
    users.forEach(u => console.log(`- ${u.email} (${u.name})`));
    console.log('---------------------------\n');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();

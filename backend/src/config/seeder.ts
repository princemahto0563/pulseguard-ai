import { connectDB } from './db';
import { seedMockData } from '../services/dbService';
import mongoose from 'mongoose';

const runSeeder = async () => {
  console.log('🔌 Connecting to database...');
  await connectDB();
  await seedMockData();
  console.log('✅ Seeding process finished.');
  
  if (process.env.MOCK_DB !== 'true') {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
  process.exit(0);
};

runSeeder().catch(err => {
  console.error('🚨 Seeder encountered a fatal error:', err);
  process.exit(1);
});

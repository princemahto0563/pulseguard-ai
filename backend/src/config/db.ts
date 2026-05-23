import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let useMock = false;

export const connectDB = async (): Promise<void> => {
  if (process.env.MOCK_DB === 'true') {
    console.log('⚠️  MOCK_DB is enabled. PulseGuard Backend is running in dynamic In-Memory Mode.');
    useMock = true;
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseguard';
  
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fail fast if local mongo isn't up
    });
    isConnected = true;
    console.log('🔌 MongoDB Connected Successfully.');
  } catch (error: any) {
    console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Falling back to In-Memory simulation mode to guarantee zero-friction execution.');
    useMock = true;
    process.env.MOCK_DB = 'true';
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected,
    isMock: useMock,
    type: useMock ? 'In-Memory Simulation' : 'MongoDB Atlas / Local'
  };
};

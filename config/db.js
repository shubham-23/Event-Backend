import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;

  if (!mongoUrl) {
    throw new Error('MONGODB_URL is not configured. Add your MongoDB Atlas connection string to .env.');
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connection successful (${mongoose.connection.name})`);
};
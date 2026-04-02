import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UPLOAD_DIR } from './config/index.js';
import extractRouter from './routes/extract.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/webmeta?authSource=admin')
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/temp/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/extract', extractRouter);
app.use('/api', apiRouter);

export default app;

import express from 'express';
import cors from 'cors';
import { UPLOAD_DIR } from './config/index.js';
import extractRouter from './routes/extract.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/temp/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/extract', extractRouter);

export default app;

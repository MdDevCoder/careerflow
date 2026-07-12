import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import interviewRoutes from './routes/interview.routes';
import documentRoutes from './routes/document.routes';
import analyticsRoutes from './routes/analytics.routes';

import { env } from './config/env';

const app = express();
const PORT = env.PORT;

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://careerflow-beta.vercel.app',
    env.FRONTEND_URL || ''
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Routes scaffolding
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

import { errorHandler } from './middleware/errorMiddleware';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerFlow API is running' });
});

app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI = env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
  });

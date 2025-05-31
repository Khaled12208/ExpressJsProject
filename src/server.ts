import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import { userRouter } from './routes/v1/users';
import { productRouter } from './routes/v1/products';
import { authRouter } from './routes/v1/auth';
import { testRouter } from './routes/v1/test';

// Import middleware
import { errorHandler } from './middlewares/errorHandler';
import { loggerMiddleware } from './middlewares/loggerMiddleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/express-ts-api';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);

// Test routes (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/v1/test', testRouter);
}

// Error handling
app.use(errorHandler);

// Only connect to MongoDB and start server if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log(`Connected to MongoDB (${NODE_ENV} environment)`);
      app.listen(PORT, () => {
        console.log(
          `Server is running on port ${PORT} (${NODE_ENV} environment)`
        );
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

export default app;

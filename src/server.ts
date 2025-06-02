import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { databaseConnection } from './config/database';

// Load environment variables
dotenv.config();

// Import routes
import { userRouter } from './routes/v1/users';
import { productRouter } from './routes/v1/products';
import { authRouter } from './routes/v1/auth';
import { testRouter } from './routes/v1/test';
import { healthRouter } from './routes/v1/health';

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

// Create API v1 router
const apiV1Router = express.Router();

// Attach routes to API v1 router
apiV1Router.use('/users', userRouter);
apiV1Router.use('/products', productRouter);
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/health', healthRouter);

// Test routes (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  apiV1Router.use('/test', testRouter);
}

// Mount API v1 router with prefix
app.use('/api/v1', apiV1Router);

// Error handling
app.use(errorHandler);

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await databaseConnection.connect(MONGODB_URI);
    
    // Start the server
    app.listen(PORT, () => {
      console.log(
        `🚀 Server is running on port ${PORT} (${NODE_ENV} environment)`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if not in test mode
startServer();

export default app;

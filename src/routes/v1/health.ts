import { Router, Request, Response } from 'express';
import { HealthCheck } from '../../config/healthCheck';

export const healthRouter = Router();

// Health check endpoint
healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    const healthResult = await HealthCheck.performHealthCheck();
    
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthResult);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Database-specific health check
healthRouter.get('/database', async (req: Request, res: Response) => {
  try {
    const dbHealth = await HealthCheck.getDatabaseHealth();
    
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(dbHealth);
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}); 
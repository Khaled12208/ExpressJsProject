import mongoose from 'mongoose';
import { databaseConnection } from './database';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  database: {
    connected: boolean;
    readyState: string;
    host?: string;
    name?: string;
  };
  timestamp: string;
  uptime: number;
}

export class HealthCheck {
  static async getDatabaseHealth(): Promise<HealthCheckResult> {
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const readyState = mongoose.connection.readyState;
    const isConnected = databaseConnection.getConnectionStatus();

    return {
      status: isConnected && readyState === 1 ? 'healthy' : 'unhealthy',
      database: {
        connected: isConnected,
        readyState: readyStates[readyState as keyof typeof readyStates] || 'unknown',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  static async performHealthCheck(): Promise<HealthCheckResult> {
    return await this.getDatabaseHealth();
  }
} 
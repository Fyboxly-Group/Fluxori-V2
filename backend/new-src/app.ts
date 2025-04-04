/**
 * Express Application Setup
 * Main application configuration with proper TypeScript support
 */
import 'reflect-metadata'; // Required for InversifyJS
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/environment';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { logger } from './utils/logger';

/**
 * Initialize Express application
 * @returns Configured Express application
 */
export function createApp(): Express {
  const app = express();
  
  // Basic middleware configuration
  configureMiddleware(app);
  
  // Add basic health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Root route
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Fluxori-V2 API',
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
    });
  });
  
  // API routes
  // Product routes
  app.use('/api/products', require('./routes/product.routes').default);
  
  // Not found middleware (404)
  app.use(notFoundMiddleware);
  
  // Error handling middleware
  app.use(errorMiddleware);
  
  return app;
}

/**
 * Configure Express middleware
 * @param app - Express application
 */
function configureMiddleware(app: Express): void {
  // Security
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  
  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Request logging middleware
  if (env.ENABLE_REQUEST_LOGGING) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('user-agent') || '',
        });
      });
      
      next();
    });
  }
}
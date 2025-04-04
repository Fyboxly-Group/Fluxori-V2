/**
 * Server entry point
 * Initializes and starts the Express application server
 */
import { createApp } from './app';
import { env, validateEnvironment } from './config/environment';
import { connectToDatabase, disconnectFromDatabase } from './config/database';
import { logger } from './utils/logger';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate environment configuration
    validateEnvironment();
    
    // Connect to database
    await connectToDatabase();
    
    // Create Express application
    const app = createApp();
    
    // Start the server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server started on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`API URL: http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}`);
    });
    
    // Graceful shutdown handling
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Set up graceful shutdown handlers
 * @param server - HTTP server instance
 */
function setupGracefulShutdown(server: any): void {
  // Handle SIGTERM signal
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    await gracefulShutdown(server);
  });
  
  // Handle SIGINT signal (Ctrl+C)
  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully');
    await gracefulShutdown(server);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    gracefulShutdown(server);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
    gracefulShutdown(server);
  });
}

/**
 * Gracefully shut down the server
 * @param server - HTTP server instance
 */
async function gracefulShutdown(server: any): Promise<void> {
  try {
    logger.info('Closing HTTP server');
    server.close();
    
    logger.info('Closing database connections');
    await disconnectFromDatabase();
    
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
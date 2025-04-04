/**
 * Database configuration with TypeScript support
 * Handles MongoDB connection with proper error handling
 */
import mongoose from 'mongoose';
import { env } from './environment';
import { logger } from '../utils/logger';
import { DatabaseError } from '../types/error.types';

/**
 * Database connection options interface
 */
export interface IDatabaseOptions {
  uri?: string;
  dbName?: string;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  maxPoolSize?: number;
  socketTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
  retryWrites?: boolean;
}

/**
 * Default database connection options
 */
const DEFAULT_OPTIONS: IDatabaseOptions = {
  uri: env.MONGODB_URI,
  dbName: env.MONGODB_DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
};

/**
 * Connect to MongoDB with proper error handling
 * @param options - Database connection options
 * @returns Promise resolving to the mongoose connection
 */
export async function connectToDatabase(
  options: IDatabaseOptions = DEFAULT_OPTIONS
): Promise<mongoose.Connection> {
  try {
    const uri = options.uri || DEFAULT_OPTIONS.uri || '';
    const dbName = options.dbName || DEFAULT_OPTIONS.dbName;
    
    if (!uri) {
      throw new DatabaseError('Database URI is not configured');
    }
    
    logger.info(`Connecting to MongoDB database: ${dbName}`);
    
    // Set mongoose configuration
    mongoose.set('strictQuery', true);
    
    // Create connection
    await mongoose.connect(uri, {
      ...(options.dbName && { dbName: options.dbName }),
      ...(options.maxPoolSize && { maxPoolSize: options.maxPoolSize }),
      ...(options.socketTimeoutMS && { socketTimeoutMS: options.socketTimeoutMS }),
      ...(options.serverSelectionTimeoutMS && { 
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS 
      }),
      ...(options.retryWrites !== undefined && { retryWrites: options.retryWrites }),
    });
    
    // Set up connection event handlers
    const connection = mongoose.connection;
    
    connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Trying to reconnect...');
    });
    
    connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    logger.info('MongoDB connection established successfully');
    return connection;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown database connection error';
    
    logger.error('Failed to connect to MongoDB:', error);
    throw new DatabaseError(`Database connection failed: ${errorMessage}`, error);
  }
}

/**
 * Disconnects from MongoDB
 * @returns Promise that resolves when disconnected
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    logger.info('Closing MongoDB connection');
    await mongoose.disconnect();
    logger.info('MongoDB connection closed successfully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
}

/**
 * Gets the current mongoose connection
 * @returns The active mongoose connection
 */
export function getConnection(): mongoose.Connection {
  return mongoose.connection;
}
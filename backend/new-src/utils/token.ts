/**
 * JWT Token Utilities
 * Handles token generation and verification with TypeScript support
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { ID } from '../types/base.types';
import { UnauthorizedError } from '../types/error.types';
import { IJwtPayload } from '../middlewares/auth.middleware';
import { logger } from './logger';

/**
 * Token type
 */
export type TokenType = 'access' | 'refresh';

/**
 * Token configuration
 */
interface ITokenConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Token configurations by type
 */
const TOKEN_CONFIG: Record<TokenType, ITokenConfig> = {
  access: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
};

/**
 * Generates a JWT token
 * @param payload - Token payload
 * @param type - Token type
 * @returns JWT token
 */
export function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>,
  type: TokenType = 'access'
): string {
  const config = TOKEN_CONFIG[type];
  
  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn,
  });
}

/**
 * Verifies a JWT token
 * @param token - JWT token
 * @param type - Token type
 * @returns Token payload
 */
export function verifyToken(
  token: string,
  type: TokenType = 'access'
): IJwtPayload {
  try {
    const config = TOKEN_CONFIG[type];
    return jwt.verify(token, config.secret) as IJwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    
    logger.error('Error verifying token:', error);
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Gets user ID from token
 * @param token - JWT token
 * @param type - Token type
 * @returns User ID
 */
export function getUserIdFromToken(
  token: string,
  type: TokenType = 'access'
): ID {
  const payload = verifyToken(token, type);
  return payload.id as ID;
}

/**
 * Gets organization ID from token
 * @param token - JWT token
 * @param type - Token type
 * @returns Organization ID or null if not present
 */
export function getOrganizationIdFromToken(
  token: string,
  type: TokenType = 'access'
): ID | null {
  const payload = verifyToken(token, type);
  return payload.organizationId as ID || null;
}
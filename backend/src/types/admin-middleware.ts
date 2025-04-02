
import { Request, Response, NextFunction } from 'express';

/**
 * Admin middleware mock
 * This is a placeholder implementation for TypeScript checking
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  next();
};

export default adminMiddleware;

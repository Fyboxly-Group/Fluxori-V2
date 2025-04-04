/**
 * Organizations Module
 * Entry point for multi-account organizational structure
 */
import { Express } from 'express';
import organizationRoutes from './routes/organization.routes';
import roleRoutes from './routes/role.routes';
import membershipRoutes from './routes/membership.routes';

/**
 * Register organizations module routes
 * @param app Express application
 */
export function registerOrganizationsModule(app: Express): void {
  // Register routes
  app.use('/api/organizations', organizationRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/memberships', membershipRoutes);
  
  console.log('Organizations module registered');
}
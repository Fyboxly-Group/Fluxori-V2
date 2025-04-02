// @ts-nocheck - Added by final-ts-fix.js
/**
 * Marketplace Synchronization Orchestration Service
 * 
 * Orchestrates periodic synchronization of data from connected marketplaces
 * into Fluxori. Identifies active connections, triggers the appropriate adapter
 * methods, and passes the fetched data to ingestion services.
 */
import syncOrchestratorService from './services/sync-orchestrator.service';
import syncOrchestratorRoutes from './routes/sync-orchestrator.routes';

// Export the service
export default syncOrchestratorService;

// Export routes for registration in the main app
export { syncOrchestratorRoutes };

// Export types
export * from './services/sync-orchestrator.service';
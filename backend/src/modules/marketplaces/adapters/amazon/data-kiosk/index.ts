/**
 * Amazon Data Kiosk API Module
 * 
 * Provides functionality for accessing and analyzing business data through
 * queries to Amazon's data repositories, offering powerful analytics
 * capabilities for insights on sales, inventory, and business operations.
 * 
 * The Data Kiosk API allows sellers to run queries against Amazon's data
 * repositories to get valuable insights about their business.
 */

// Export the module implementation
export { 
  // Main module class
  DataKioskModule,
  
  // Core interfaces
  QueryExpression,
  QueryResponse,
  
  // Document interfaces
  CreateDocumentOptions,
  CreateDocumentResponse,
  GetDocumentsOptions,
  DocumentMetadata,
  GetDocumentsResponse,
  GetDocumentContentOptions,
  DocumentContentResponse,
  
  // Job interfaces
  ScheduleDocumentJobOptions,
  ScheduleDocumentJobResponse,
  JobStatus,
  JobMetadata,
  GetJobsOptions,
  GetJobsResponse,
  GetJobContentOptions,
  JobContentResponse
} from './data-kiosk';

// Export the factory function
export { createDataKioskModule } from './data-kiosk-factory';
import { ragRetrievalRoutes } from './routes/rag-retrieval.routes';
import { Container } from 'inversify';
import 'reflect-metadata';

// Service exports
export { EmbeddingService } from './services/embedding.service';
export { VectorSearchService } from './services/vector-search.service';
export { RagRetrievalService } from './services/rag-retrieval.service';
export { DocumentService } from './services/document.service';
export { RagRetrievalController } from './controllers/rag-retrieval.controller';

// Interface exports
export { 
  DocumentChunk, 
  DocumentMetadata,
  VectorMatch,
  SearchOptions,
  EmbeddingOptions,
  IVectorSearchService,
  IDocumentService,
  IEmbeddingService,
  IRagRetrievalService,
  IRagRetrievalController
} from './interfaces/vector-search.interface';

// Container for dependency injection
const ragRetrievalContainer = new Container();

/**
 * Initialize the RAG (Retrieval Augmented Generation) Retrieval module
 * @returns The initialized DI container for the module
 */
export const initializeRagRetrievalModule = () => {
  console.log('RAG Retrieval module initialized');
  return ragRetrievalContainer;
};

export { ragRetrievalRoutes };
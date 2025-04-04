import { Request, Response, NextFunction } from 'express';

/**
 * Interface for a document chunk in the knowledge base
 */
export interface DocumentChunk {
  id: string;
  text: string;
  metadata: DocumentMetadata;
}

/**
 * Metadata for a document chunk
 */
export interface DocumentMetadata {
  source: string;
  title?: string;
  url?: string;
  created?: Date;
  updated?: Date;
  author?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Vector search match result
 */
export interface VectorMatch {
  id: string;
  score: number;
  metadata: DocumentMetadata;
}

/**
 * Search options for vector search
 */
export interface SearchOptions {
  topK?: number;
  filter?: {
    [key: string]: any;
  };
  minScore?: number;
}

/**
 * Options for embedding generation
 */
export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

/**
 * Interface for VectorSearchService
 */
export interface IVectorSearchService {
  searchSimilarVectors(embedding: number[], options?: SearchOptions): Promise<VectorMatch[]>;
}

/**
 * Interface for DocumentService
 */
export interface IDocumentService {
  getDocumentChunks(ids: string[]): Promise<DocumentChunk[]>;
  getDocumentChunk(id: string): Promise<DocumentChunk | null>;
}

/**
 * Interface for EmbeddingService
 */
export interface IEmbeddingService {
  generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]>;
  generateBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;
}

/**
 * Interface for RagRetrievalService
 */
export interface IRagRetrievalService {
  getContextSnippets(query: string, topK?: number, options?: Partial<SearchOptions>): Promise<string[]>;
  getContextDocuments(query: string, topK?: number, options?: Partial<SearchOptions>): Promise<DocumentChunk[]>;
  retrieveContext(query: string, conversationHistory?: string, topK?: number): Promise<string>;
}

/**
 * Interface for RagRetrievalController
 */
export interface IRagRetrievalController {
  getContextSnippets(req: Request, res: Response, next: NextFunction): Promise<void>;
  getContextDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
  getLlmContext(req: Request, res: Response, next: NextFunction): Promise<void>;
}
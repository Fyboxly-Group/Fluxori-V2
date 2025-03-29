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
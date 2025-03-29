import { EmbeddingService } from './embedding.service';
import { VectorSearchService } from './vector-search.service';
import { DocumentService } from './document.service';
import { DocumentChunk, SearchOptions } from '../interfaces/vector-search.interface';

/**
 * Service that handles RAG (Retrieval Augmented Generation) operations
 * Combines embedding generation, vector search, and document retrieval
 */
export class RagRetrievalService {
  private embeddingService: EmbeddingService;
  private vectorSearchService: VectorSearchService;
  private documentService: DocumentService;
  
  /**
   * Creates an instance of RagRetrievalService.
   */
  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorSearchService = new VectorSearchService();
    this.documentService = new DocumentService();
  }
  
  /**
   * Get relevant context snippets for a query
   * @param query The user query
   * @param topK Maximum number of snippets to return (default: 3)
   * @param options Additional search options
   * @returns Array of relevant text snippets
   */
  public async getContextSnippets(
    query: string,
    topK: number = 3,
    options: Partial<SearchOptions> = {}
  ): Promise<string[]> {
    try {
      console.log(`Retrieving context for query: ${query}`);
      const startTime = Date.now();
      
      // 1. Generate embedding for the query
      const embedding = await this.embeddingService.generateEmbedding(query);
      
      // 2. Search for similar vectors
      const searchOptions: SearchOptions = {
        topK,
        minScore: options.minScore || 0.7,
        filter: options.filter
      };
      
      const vectorMatches = await this.vectorSearchService.searchSimilarVectors(embedding, searchOptions);
      
      if (vectorMatches.length === 0) {
        console.log(`No relevant context found for query (${Date.now() - startTime}ms)`);
        return [];
      }
      
      // 3. Get document IDs from matches
      const docIds = vectorMatches.map(match => match.id);
      
      // 4. Retrieve the actual document chunks
      const documentChunks = await this.documentService.getDocumentChunks(docIds);
      
      // 5. Extract and return the text snippets
      const snippets = documentChunks.map(doc => doc.text);
      
      console.log(`Retrieved ${snippets.length} context snippets for query (${Date.now() - startTime}ms)`);
      return snippets;
    } catch (error) {
      console.error('Error getting context snippets:', error);
      return [];
    }
  }
  
  /**
   * Get relevant context snippets with their metadata
   * @param query The user query
   * @param topK Maximum number of snippets to return (default: 3)
   * @param options Additional search options
   * @returns Array of document chunks with text and metadata
   */
  public async getContextDocuments(
    query: string,
    topK: number = 3,
    options: Partial<SearchOptions> = {}
  ): Promise<DocumentChunk[]> {
    try {
      console.log(`Retrieving context documents for query: ${query}`);
      const startTime = Date.now();
      
      // 1. Generate embedding for the query
      const embedding = await this.embeddingService.generateEmbedding(query);
      
      // 2. Search for similar vectors
      const searchOptions: SearchOptions = {
        topK,
        minScore: options.minScore || 0.7,
        filter: options.filter
      };
      
      const vectorMatches = await this.vectorSearchService.searchSimilarVectors(embedding, searchOptions);
      
      if (vectorMatches.length === 0) {
        console.log(`No relevant context found for query (${Date.now() - startTime}ms)`);
        return [];
      }
      
      // 3. Get document IDs from matches
      const docIds = vectorMatches.map(match => match.id);
      
      // 4. Retrieve the actual document chunks
      const documentChunks = await this.documentService.getDocumentChunks(docIds);
      
      // 5. Add match scores to document metadata
      const enhancedDocuments = documentChunks.map(doc => {
        const match = vectorMatches.find(m => m.id === doc.id);
        return {
          ...doc,
          metadata: {
            ...doc.metadata,
            matchScore: match ? match.score : 0
          }
        };
      });
      
      // 6. Sort by match score (highest first)
      enhancedDocuments.sort((a, b) => 
        (b.metadata.matchScore as number) - (a.metadata.matchScore as number)
      );
      
      console.log(`Retrieved ${enhancedDocuments.length} context documents for query (${Date.now() - startTime}ms)`);
      return enhancedDocuments;
    } catch (error) {
      console.error('Error getting context documents:', error);
      return [];
    }
  }
  
  /**
   * Find relevant context for a query, including conversation history for better retrieval
   * @param query The user query
   * @param conversationHistory Optional recent message history for context
   * @param topK Maximum number of snippets to return (default: 3)
   * @returns Formatted context string for the LLM
   */
  public async retrieveContext(
    query: string,
    conversationHistory?: string,
    topK: number = 3
  ): Promise<string> {
    try {
      // Create an enhanced query that includes recent conversation history if available
      let enhancedQuery = query;
      if (conversationHistory && conversationHistory.trim() !== '') {
        // Combine the query with recent conversation history for better context
        enhancedQuery = `${conversationHistory}\n\nCurrent question: ${query}`;
      }
      
      // Get context snippets
      const snippets = await this.getContextSnippets(enhancedQuery, topK);
      
      if (snippets.length === 0) {
        return ''; // No context found
      }
      
      // Format snippets into a single context string
      return this.formatContextForLlm(snippets);
    } catch (error) {
      console.error('Error retrieving context:', error);
      return ''; // Return empty string on error
    }
  }
  
  /**
   * Format multiple context snippets into a single string for the LLM
   * @param snippets Array of text snippets
   * @returns Formatted context string
   */
  private formatContextForLlm(snippets: string[]): string {
    // Join the snippets with separator for clarity
    return snippets.map((snippet, index) => 
      `[Document ${index + 1}]\n${snippet.trim()}`
    ).join('\n\n');
  }
}
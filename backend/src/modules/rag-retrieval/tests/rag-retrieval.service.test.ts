import { RagRetrievalService } from '../services/rag-retrieval.service';
import { EmbeddingService } from '../services/embedding.service';
import { VectorSearchService } from '../services/vector-search.service';
import { DocumentService } from '../services/document.service';

// Mock the dependencies
jest.mock('../services/embedding.service');
jest.mock('../services/vector-search.service');
jest.mock('../services/document.service');

describe('RagRetrievalService', () => {
  let ragRetrievalService: RagRetrievalService;
  
  // Mock implementations
  const mockEmbeddingService = EmbeddingService as jest.MockedClass<typeof EmbeddingService>;
  const mockVectorSearchService = VectorSearchService as jest.MockedClass<typeof VectorSearchService>;
  const mockDocumentService = DocumentService as jest.MockedClass<typeof DocumentService>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create service instance
    ragRetrievalService = new RagRetrievalService();
  });
  
  describe('getContextSnippets', () => {
    it('should return snippets when query matches documents', async () => {
      // Mock embedding generation
      mockEmbeddingService.prototype.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      
      // Mock vector search
      mockVectorSearchService.prototype.searchSimilarVectors.mockResolvedValue([
        { id: 'doc1', score: 0.95, metadata: { source: 'kb' } },
        { id: 'doc2', score: 0.85, metadata: { source: 'kb' } }
      ]);
      
      // Mock document retrieval
      mockDocumentService.prototype.getDocumentChunks.mockResolvedValue([
        { id: 'doc1', text: 'This is document 1', metadata: { source: 'kb' } },
        { id: 'doc2', text: 'This is document 2', metadata: { source: 'kb' } }
      ]);
      
      // Execute
      const result = await ragRetrievalService.getContextSnippets('test query', 2);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain('This is document 1');
      expect(result).toContain('This is document 2');
      
      // Verify method calls
      expect(mockEmbeddingService.prototype.generateEmbedding).toHaveBeenCalledWith('test query');
      expect(mockVectorSearchService.prototype.searchSimilarVectors).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3], 
        expect.objectContaining({ topK: 2 })
      );
      expect(mockDocumentService.prototype.getDocumentChunks).toHaveBeenCalledWith(['doc1', 'doc2']);
    });
    
    it('should return empty array when no matches found', async () => {
      // Mock embedding generation
      mockEmbeddingService.prototype.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      
      // Mock empty vector search result
      mockVectorSearchService.prototype.searchSimilarVectors.mockResolvedValue([]);
      
      // Execute
      const result = await ragRetrievalService.getContextSnippets('no match query', 3);
      
      // Assert
      expect(result).toEqual([]);
      
      // Verify document service was not called
      expect(mockDocumentService.prototype.getDocumentChunks).not.toHaveBeenCalled();
    });
    
    it('should handle errors gracefully', async () => {
      // Mock embedding error
      mockEmbeddingService.prototype.generateEmbedding.mockRejectedValue(
        new Error('Embedding service error')
      );
      
      // Execute
      const result = await ragRetrievalService.getContextSnippets('error query', 3);
      
      // Assert
      expect(result).toEqual([]);
      
      // Verify downstream services were not called
      expect(mockVectorSearchService.prototype.searchSimilarVectors).not.toHaveBeenCalled();
      expect(mockDocumentService.prototype.getDocumentChunks).not.toHaveBeenCalled();
    });
  });
  
  describe('retrieveContext', () => {
    it('should format context snippets with conversation history', async () => {
      // Mock getContextSnippets to return some snippets;
      jest.spyOn(ragRetrievalService, 'getContextSnippets').mockResolvedValue([
        'First document content',
        'Second document content'
      ]);
      
      // Execute with conversation history
      const result = await ragRetrievalService.retrieveContext(
        'What is the pricing?',
        'user: Hello\nassistant: How can I help you?'
      );
      
      // Assert
      expect(result).toContain('[Document 1]');
      expect(result).toContain('First document content');
      expect(result).toContain('[Document 2]');
      expect(result).toContain('Second document content');
      
      // Verify getContextSnippets was called with enhanced query
      expect(ragRetrievalService.getContextSnippets).toHaveBeenCalledWith(
        expect.stringContaining('Hello'),
        expect.anything()
      );
    });
    
    it('should return empty string when no context found', async () => {
      // Mock getContextSnippets to return empty array;
      jest.spyOn(ragRetrievalService, 'getContextSnippets').mockResolvedValue([]);
      
      // Execute
      const result = await ragRetrievalService.retrieveContext('What is the pricing?');
      
      // Assert
      expect(result).toBe('');
    });
  });
});
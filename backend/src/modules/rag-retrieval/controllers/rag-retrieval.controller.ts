import { Request, Response, NextFunction } from 'express';
import { RagRetrievalService } from '../services/rag-retrieval.service';
import { ApiError } from '../../../middleware/error.middleware';

/**
 * Controller for RAG Retrieval API endpoints
 */
export class RagRetrievalController {
  private static ragRetrievalService = new RagRetrievalService();
  
  /**
   * Retrieve context snippets for a query
   * @route POST /api/rag-retrieval/context
   */
  public static async getContextSnippets(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, conversationHistory, topK = 3 } = req.body;
      
      // Validate request
      if (!query) {
        throw new ApiError(400, 'Query is required');
      }
      
      // Get context
      const snippets = await this.ragRetrievalService.getContextSnippets(
        query,
        topK
      );
      
      // Return the results
      return res.status(200).json({
        success: true,
        data: {
          snippets,
          count: snippets.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Retrieve context documents with metadata for a query
   * @route POST /api/rag-retrieval/documents
   */
  public static async getContextDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, topK = 3, minScore = 0.7, filter } = req.body;
      
      // Validate request
      if (!query) {
        throw new ApiError(400, 'Query is required');
      }
      
      // Get context documents
      const documents = await this.ragRetrievalService.getContextDocuments(
        query,
        topK,
        { minScore, filter }
      );
      
      // Return the results
      return res.status(200).json({
        success: true,
        data: {
          documents,
          count: documents.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Retrieve formatted context for an LLM
   * @route POST /api/rag-retrieval/llm-context
   */
  public static async getLlmContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, conversationHistory, topK = 3 } = req.body;
      
      // Validate request
      if (!query) {
        throw new ApiError(400, 'Query is required');
      }
      
      // Get context
      const context = await this.ragRetrievalService.retrieveContext(
        query,
        conversationHistory,
        topK
      );
      
      // Return the results
      return res.status(200).json({
        success: true,
        data: {
          context,
          hasContext: context.trim() !== ''
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
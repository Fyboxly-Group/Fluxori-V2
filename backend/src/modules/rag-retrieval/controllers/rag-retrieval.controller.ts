import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { RagRetrievalService } from '../services/rag-retrieval.service';
import { ApiError } from '../../../middleware/error.middleware';
import { IRagRetrievalService, IRagRetrievalController } from '../interfaces/vector-search.interface';

/**
 * Controller for RAG Retrieval API endpoints
 */
@injectable()
export class RagRetrievalController implements IRagRetrievalController {
  private ragRetrievalService: IRagRetrievalService;
  
  /**
   * Creates an instance of RagRetrievalController with dependency injection
   */
  constructor(
    @inject(RagRetrievalService) ragRetrievalService: IRagRetrievalService
  ) {
    this.ragRetrievalService = ragRetrievalService;
  }
  
  /**
   * Retrieve context snippets for a query
   * @route POST /api/rag-retrieval/context
   */
  public async getContextSnippets(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      res.status(200).json({
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
  public async getContextDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      res.status(200).json({
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
  public async getLlmContext(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      res.status(200).json({
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
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { ConversationService } from '../services/conversation.service';
import { ApiError } from '../../../utils/error.utils';

/**
 * Extended request with authenticated user
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
}

/**
 * Conversation controller handles all conversation-related API endpoints
 */
class ConversationController {
  private conversationService: ConversationService;
  
  constructor() {
    this.conversationService = new ConversationService();
  }

  /**
   * Get conversation by ID
   * @route GET /api/conversations/:id
   */
  public async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      
      if (!userId || !organizationId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }
      
      const conversation = await this.conversationService.getConversationById(id, organizationId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process a new message in conversation
   * @route POST /api/conversations/message
   */
  public async processMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      
      if (!userId || !organizationId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }
      
      if (!message) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Message is required');
      }
      
      const response = await this.conversationService.processMessage(
        userId,
        message,
        conversationId,
        organizationId
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations for user
   * @route GET /api/conversations
   */
  public async getUserConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      
      if (!userId || !organizationId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      
      const { conversations, total } = await this.conversationService.getUserConversations(
        userId,
        organizationId,
        page,
        limit
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: conversations,
        meta: {
          total,
          page,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Close a conversation
   * @route PUT /api/conversations/:id/close
   */
  public async closeConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
      
      if (!userId || !organizationId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
      }
      
      const updatedConversation = await this.conversationService.closeConversation(
        id,
        userId,
        organizationId
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedConversation
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create and export controller instance
export const conversationController = new ConversationController();
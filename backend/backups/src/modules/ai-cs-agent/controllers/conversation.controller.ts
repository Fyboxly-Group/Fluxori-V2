/**
 * Conversation Controller for AI CS Agent
 * 
 * Handles API requests for AI conversation functionality
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { Types } from 'mongoose';
import { 
  IConversationController, 
  IConversationService, 
  ConversationStatus 
} from '../interfaces/conversation.interface';

/**
 * Conversation Controller Implementation
 */
@injectable()
export class ConversationController implements IConversationController {
  /**
   * Constructor
   */
  constructor(
    @inject('Logger') private logger: Logger,
    @inject('ConversationService') private conversationService: IConversationService
  ) {}

  /**
   * Get conversation by ID
   */
  public getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;
      
      if (!conversationId || !Types.ObjectId.isValid(conversationId)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid conversation ID' 
        });
        return;
      }
      
      const conversation = await this.conversationService.getConversationById(conversationId);
      
      if (!conversation) {
        res.status(404).json({ 
          success: false, 
          message: 'Conversation not found' 
        });
        return;
      }
      
      // Check if user has access to this conversation
      if (conversation.userId.toString() !== userId && 
          (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('support'))) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this conversation' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      this.logger.error('Error getting conversation', { error });
      next(error);
    }
  };

  /**
   * Process a new message in conversation
   */
  public processMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId, message } = req.body;
      const userId = req.user?.id;
      
      if (!conversationId || !Types.ObjectId.isValid(conversationId) || !message) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid request. Conversation ID and message are required.' 
        });
        return;
      }
      
      // Ensure conversation belongs to user or user has admin/support role
      const conversation = await this.conversationService.getConversationById(conversationId);
      
      if (!conversation) {
        res.status(404).json({ 
          success: false, 
          message: 'Conversation not found' 
        });
        return;
      }
      
      if (conversation.userId.toString() !== userId && 
          (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('support'))) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this conversation' 
        });
        return;
      }
      
      // Check if conversation is active
      if (conversation.status !== ConversationStatus.ACTIVE) {
        res.status(400).json({ 
          success: false, 
          message: `Cannot add message to a ${conversation.status} conversation` 
        });
        return;
      }
      
      // Process the message
      const response = await this.conversationService.processUserMessage(conversationId, message);
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      this.logger.error('Error processing message', { error });
      next(error);
    }
  };

  /**
   * Get all conversations for user
   */
  public getUserConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { status } = req.query;
      
      const validStatus = status && Object.values(ConversationStatus).includes(status as ConversationStatus)
        ? status as ConversationStatus
        : undefined;
        
      const conversations = await this.conversationService.getUserConversations(userId, validStatus);
      
      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      this.logger.error('Error getting user conversations', { error });
      next(error);
    }
  };

  /**
   * Close a conversation
   */
  public closeConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;
      
      if (!conversationId || !Types.ObjectId.isValid(conversationId)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid conversation ID' 
        });
        return;
      }
      
      // Ensure conversation belongs to user or user has admin/support role
      const conversation = await this.conversationService.getConversationById(conversationId);
      
      if (!conversation) {
        res.status(404).json({ 
          success: false, 
          message: 'Conversation not found' 
        });
        return;
      }
      
      if (conversation.userId.toString() !== userId && 
          (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('support'))) {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to modify this conversation' 
        });
        return;
      }
      
      // Close the conversation
      const closedConversation = await this.conversationService.closeConversation(conversationId, reason);
      
      res.status(200).json({
        success: true,
        data: closedConversation,
        message: 'Conversation closed successfully'
      });
    } catch (error) {
      this.logger.error('Error closing conversation', { error });
      next(error);
    }
  };
}

/**
 * Export Conversation Controller Factory
 */
export const createConversationController = (
  logger: Logger,
  conversationService: IConversationService
): IConversationController => {
  return new ConversationController(logger, conversationService);
};
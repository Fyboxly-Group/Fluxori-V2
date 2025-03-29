import { Request, Response, NextFunction } from 'express';
import { ConversationService, IProcessedResponse } from '../services/conversation.service';
import { ConversationStatus } from '../models/conversation.model';
import { ApiError } from '../../../middleware/error.middleware';
import { InsufficientCreditsError } from '../../credits/services/credit.service';

// Controller for handling REST API requests
export class ConversationController {
  private static conversationService = new ConversationService();
  
  /**
   * Process a new user message
   * @route POST /api/ai-cs-agent/message
   */
  public static async processMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationId, organizationId } = req.body;
      
      // Validate the request
      if (!message) {
        throw new ApiError(400, 'Message is required');
      }
      
      // Get user ID from authenticated request
      if (!req.user || !req.user._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = req.user._id.toString();
      
      // Process the message
      const response = await this.conversationService.processMessage(
        userId,
        message,
        conversationId,
        organizationId
      );
      
      // Return the response
      return res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return res.status(402).json({
          success: false,
          message: error.message,
          error: 'INSUFFICIENT_CREDITS'
        });
      }
      
      next(error);
    }
  }
  
  /**
   * Get a user's conversation history
   * @route GET /api/ai-cs-agent/conversations
   */
  public static async getUserConversations(req: Request, res: Response, next: NextFunction) {
    try {
      // Get query parameters
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as ConversationStatus;
      
      // Get user ID from authenticated request
      if (!req.user || !req.user._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = req.user._id.toString();
      
      // Get conversations
      const conversations = await this.conversationService.getUserConversations(
        userId,
        limit,
        offset,
        status
      );
      
      // Return them
      return res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get a specific conversation by ID
   * @route GET /api/ai-cs-agent/conversations/:id
   */
  public static async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id;
      
      // Get user ID from authenticated request
      if (!req.user || !req.user._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = req.user._id.toString();
      
      // Get the conversation
      const conversation = await this.conversationService.getConversation(
        conversationId,
        userId
      );
      
      // Return it
      return res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Close a conversation
   * @route POST /api/ai-cs-agent/conversations/:id/close
   */
  public static async closeConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id;
      
      // Get user ID from authenticated request
      if (!req.user || !req.user._id) {
        throw new ApiError(401, 'Authentication required');
      }
      
      const userId = req.user._id.toString();
      
      // Close the conversation
      const conversation = await this.conversationService.closeConversation(
        conversationId,
        userId
      );
      
      // Return it
      return res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }
}

// WebSocket handler class (for real-time streaming)
export class WebSocketHandler {
  private static conversationService = new ConversationService();
  
  /**
   * Handle WebSocket messages
   * @param socket The WebSocket connection
   * @param message The message received
   */
  public static async handleMessage(socket: any, data: any) {
    try {
      // Verify the message format
      if (!data || !data.message || !data.userId) {
        socket.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
        return;
      }
      
      const { message, userId, conversationId, organizationId } = data;
      
      // TODO: In a production implementation, you would verify the user ID
      // from a token passed with the WebSocket connection
      
      // Process the message
      try {
        // First, acknowledge receipt
        socket.send(JSON.stringify({
          type: 'ack',
          conversationId
        }));
        
        // Then process (this might take some time due to Vertex AI call)
        const response = await this.conversationService.processMessage(
          userId,
          message,
          conversationId,
          organizationId
        );
        
        // Send the final response
        socket.send(JSON.stringify({
          type: 'response',
          data: response
        }));
      } catch (error) {
        // Handle insufficient credits error
        if (error instanceof InsufficientCreditsError) {
          socket.send(JSON.stringify({
            type: 'error',
            error: 'INSUFFICIENT_CREDITS',
            message: error.message
          }));
          return;
        }
        
        // Handle other errors
        socket.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    } catch (error) {
      console.error('Error in WebSocket handler:', error);
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Internal server error'
      }));
    }
  }
  
  /**
   * For streaming implementations, this would stream tokens as they come
   * This is a placeholder for future implementation
   */
  private static streamResponse(socket: any, text: string) {
    // Simplified implementation - in real world, you'd stream tokens from the Vertex AI API
    const words = text.split(' ');
    
    // Send words with delays to simulate streaming
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        socket.send(JSON.stringify({
          type: 'token',
          token: words[i] + ' '
        }));
        i++;
      } else {
        clearInterval(interval);
        socket.send(JSON.stringify({
          type: 'end_stream'
        }));
      }
    }, 100); // 100ms between words
  }
}
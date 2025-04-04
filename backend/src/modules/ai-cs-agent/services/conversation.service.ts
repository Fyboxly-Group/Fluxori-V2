import mongoose from 'mongoose';
import Conversation, { 
  ConversationStatus,
  IConversationDocument, 
  IMessage, 
  MessageRole 
} from '../models/conversation.model';
import { 
  VertexAIService, 
  IVertexMessage, 
  ILlmResponse, 
  LlmModel 
} from './vertex-ai.service';
import { RAGService } from './rag.service';
import { CreditService } from '../../credits/services/credit.service';

// Constants for the service
const CREDITS_PER_INTERACTION = 4;
const MAX_HISTORY_MESSAGES = 20; // Maximum number of messages to include in history
const MAX_CONTEXT_LENGTH = 100000; // Maximum context length in characters

// Interface for the processed response
export interface IProcessedResponse {
  conversationId: string;
  aiResponse: string;
  isEscalated: boolean;
  escalationReason?: string;
  usage: {
    tokens: number;
    credits: number;
    confidence: number;
  }
}

/**
 * Service to manage AI customer service conversations
 */
export class ConversationService {
  private vertexAI: VertexAIService;
  private ragService: RAGService;
  
  constructor() {
    this.vertexAI = new VertexAIService();
    this.ragService = new RAGService();
  }
  
  /**
   * Process a new user message
   * @param userId User ID
   * @param message User message content
   * @param conversationId Optional existing conversation ID
   * @param organizationId Optional organization ID
   * @returns The processed response
   */
  public async processMessage(userId: string, message: string, conversationId?: string, organizationId?: string): Promise<IProcessedResponse> {
    try {
      // Get or create the conversation
      let conversation: IConversationDocument;
      if(conversationId) {
        conversation = await this.getConversation(conversationId, userId);
        
        // Check if conversation is already escalated or closed
        if(conversation.status === ConversationStatus.ESCALATED) {
          throw new Error('This conversation has been escalated to a human agent');
        }
        
        if(conversation.status === ConversationStatus.CLOSED) {
          throw new Error('This conversation is closed');
        }
      } else {
        conversation = await this.createConversation(userId, organizationId);
      }
      
      // Add the user message to the conversation
      const userMessage: IMessage = {
        role: MessageRole.USER,
        content: message,
        timestamp: new Date()
      };
      
      conversation.messages.push(userMessage);
      conversation.lastMessageAt = new Date();
      await conversation.save();
      
      // Get the conversation history formatted for the LLM
      const history = this.formatMessagesForLLM(conversation.messages.slice(-MAX_HISTORY_MESSAGES));
      
      // Get relevant context from RAG
      const recentMessages = conversation.messages.slice(-3)
        .map((m) => `${m.role}: ${m.content}`).join('\n');
      
      const ragContext = await this.ragService.retrieveContext(message, recentMessages);
      
      // Select the best model for this conversation
      const selectedModel = this.vertexAI.selectBestModel(history, message);
      
      // Call the LLM to generate a response
      const llmResponse = await this.vertexAI.generateResponse(history, 0.3, 2048, ragContext, selectedModel);
      
      // Calculate confidence score
      const confidenceScore = this.vertexAI.calculateConfidence(llmResponse.text);
      
      // Check if we should escalate
      const escalationResult = this.vertexAI.shouldEscalate(llmResponse.text, confidenceScore);
      
      // Create the assistant message
      const assistantMessage: IMessage = {
        role: MessageRole.ASSISTANT,
        content: llmResponse.text,
        timestamp: new Date(),
        metadata: {
          tokens: llmResponse.usage.total_tokens,
          confidence: confidenceScore,
          model: llmResponse.metadata.model,
          finish_reason: llmResponse.metadata.finish_reason,
          model_selection_reason: this.getModelSelectionReason(selectedModel, history.length, message)
        }
      };
      
      // Update the conversation with the assistant's response
      conversation.messages.push(assistantMessage);
      
      // Update escalation status if needed
      if(escalationResult.escalate) {
        conversation.status = ConversationStatus.ESCALATED;
        if(!conversation.metadata) {
          conversation.metadata = {};
        }
        conversation.metadata.escalationReason = escalationResult.reason;
        conversation.metadata.escalatedAt = new Date();
        
        // Add escalation note
        const systemMessage: IMessage = {
          role: MessageRole.SYSTEM,
          content: `Conversation escalated to human agent. Reason: ${escalationResult.reason}`,
          timestamp: new Date()
        };
        conversation.messages.push(systemMessage);
        
        // TODO: Trigger notification to human agents (placeholder for now)
        console.log(`ESCALATION ALERT: Conversation ${conversation._id} escalated to human agent. Reason: ${escalationResult.reason}`);
      }
      
      // Save updated conversation
      await conversation.save();
      
      // Deduct credits for the interaction
      try {
        await CreditService.deductCredits(
          userId, 
          CREDITS_PER_INTERACTION, 
          'AI Customer Service Agent interaction',
          organizationId,
          conversation._id.toString()
        );
      } catch(error) {
        console.error('Error deducting credits:', error);
        // We'll still return the response even if credit deduction fails
        // In production, you might want to handle this differently
      }
      
      // Return the formatted response
      return {
        conversationId: conversation._id.toString(),
        aiResponse: llmResponse.text,
        isEscalated: escalationResult.escalate,
        escalationReason: escalationResult.reason,
        usage: {
          tokens: llmResponse.usage.total_tokens,
          credits: CREDITS_PER_INTERACTION,
          confidence: confidenceScore
        }
      };
    } catch(error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Format conversation messages for the LLM
   * @param messages Array of messages to format
   * @returns Formatted messages for LLM
   */
  private formatMessagesForLLM(messages: IMessage[]): IVertexMessage[] {
    return messages.map((message) => ({ 
      role: message.role, 
      content: message.content
    }));
  }
  
  /**
   * Generate a reason for model selection for logging and analysis
   * @param model The model that was selected
   * @param historyLength Length of conversation history
   * @param latestMessage Latest user message
   * @returns Explanation of why the model was chosen
   */
  private getModelSelectionReason(model: LlmModel, historyLength: number, latestMessage: string): string {
    const lowerMessage = latestMessage.toLowerCase();
    
    // Check for technical terms
    const technicalTerms = [
      'code', 'api', 'integration', 'error', 'bug', 'implementation',
      'developer', 'technical', 'database', 'configuration', 'setup'
    ];
    
    const foundTechnicalTerms = technicalTerms.filter(term => lowerMessage.includes(term));
    
    // Check for complex reasoning terms
    const complexReasoningTerms = [
      'explain why', 'detailed explanation', 'compare', 'difference between',
      'analyze', 'review', 'evaluate', 'assess'
    ];
    
    const foundComplexTerms = complexReasoningTerms.filter(term => lowerMessage.includes(term));
    
    // Build reason
    let reason = `Selected model: ${model}. `;
    
    if(historyLength > 15) {
      reason += `Long conversation (${historyLength} messages). `;
    }
    
    if(foundTechnicalTerms.length > 0) {
      reason += `Technical query detected (${foundTechnicalTerms.join(', ')}). `;
    }
    
    if(foundComplexTerms.length > 0) {
      reason += `Complex reasoning needed (${foundComplexTerms.join(', ')}). `;
    }
    
    if(historyLength <= 15 && foundTechnicalTerms.length === 0 && foundComplexTerms.length === 0) {
      reason += 'General customer service query.';
    }
    
    return reason;
  }
  
  /**
   * Get a conversation by ID
   * @param conversationId Conversation ID
   * @param userId User ID (for verification)
   * @returns The conversation document
   */
  public async getConversation(conversationId: string, userId: string): Promise<IConversationDocument> {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if(!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Verify the conversation belongs to the user
      if(conversation.userId.toString() !== userId) {
        throw new Error('Unauthorized access to conversation');
      }
      
      return conversation;
    } catch(error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   * @param userId User ID
   * @param organizationId Optional organization ID
   * @returns New conversation document
   */
  public async createConversation(userId: string, organizationId?: string): Promise<IConversationDocument> {
    try {
      const conversationData: Partial<IConversationDocument> = {
        userId: new mongoose.Types.ObjectId(userId),
        status: ConversationStatus.ACTIVE,
        messages: [],
        lastMessageAt: new Date()
      };
      
      if(organizationId) {
        conversationData.organizationId = new mongoose.Types.ObjectId(organizationId);
      }
      
      const conversation = new Conversation(conversationData);
      await conversation.save();
      return conversation;
    } catch(error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for a user
   * @param userId User ID
   * @param limit Maximum number of conversations to return
   * @param offset Offset for pagination
   * @param status Optional filter by conversation status
   * @returns Array of conversations
   */
  public async getUserConversations(
    userId: string, 
    limit: number = 10, 
    offset: number = 0, 
    status?: ConversationStatus
  ): Promise<IConversationDocument[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if(status) {
        query.status = status;
      }
      
      const conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(offset)
        .limit(limit);
        
      return conversations;
    } catch(error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Close a conversation
   * @param conversationId Conversation ID
   * @param userId User ID (for verification)
   * @returns Updated conversation
   */
  public async closeConversation(conversationId: string, userId: string): Promise<IConversationDocument> {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      
      conversation.status = ConversationStatus.CLOSED;
      if(!conversation.metadata) {
        conversation.metadata = {};
      }
      conversation.metadata.closedAt = new Date();
      
      // Add a system message about closing
      const systemMessage: IMessage = {
        role: MessageRole.SYSTEM,
        content: 'Conversation closed by user',
        timestamp: new Date()
      };
      conversation.messages.push(systemMessage);
      
      await conversation.save();
      return conversation;
    } catch(error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  }
}
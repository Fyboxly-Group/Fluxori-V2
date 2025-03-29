import mongoose from 'mongoose';
import { ConversationService } from '../services/conversation.service';
import { VertexAIService } from '../services/vertex-ai.service';
import { RAGService } from '../services/rag.service';
import Conversation, { ConversationStatus } from '../models/conversation.model';
import { CreditService } from '../../credits/services/credit.service';

// Mock the external services
jest.mock('../services/vertex-ai.service');
jest.mock('../services/rag.service');
jest.mock('../../credits/services/credit.service');

describe('ConversationService', () => {
  let conversationService: ConversationService;
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockOrgId = '507f1f77bcf86cd799439012';
  
  beforeEach(() => {
    conversationService = new ConversationService();
    
    // Mock the VertexAI service
    (VertexAIService.prototype.generateResponse as jest.Mock).mockResolvedValue({
      text: 'This is a mock AI response.',
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150
      },
      metadata: {
        model: 'gemini-1.5-flash',
        finish_reason: 'stop'
      }
    });
    
    (VertexAIService.prototype.calculateConfidence as jest.Mock).mockReturnValue(0.85);
    (VertexAIService.prototype.shouldEscalate as jest.Mock).mockReturnValue({ 
      escalate: false 
    });
    
    // Mock the RAG service
    (RAGService.prototype.retrieveContext as jest.Mock).mockResolvedValue(
      'This is mock context for RAG retrieval.'
    );
    
    // Mock the Credit service
    (CreditService.deductCredits as jest.Mock).mockResolvedValue({
      balance: 100
    });
    
    // Mock Mongoose methods
    jest.spyOn(Conversation.prototype, 'save').mockImplementation(function(this: any) {
      if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
      }
      return Promise.resolve(this);
    });
    
    jest.spyOn(Conversation, 'findById').mockImplementation((id) => {
      const conversation = new Conversation({
        userId: new mongoose.Types.ObjectId(mockUserId),
        status: ConversationStatus.ACTIVE,
        messages: [],
        lastMessageAt: new Date()
      });
      conversation._id = new mongoose.Types.ObjectId(id as string);
      return {
        exec: jest.fn().mockResolvedValue(conversation)
      } as any;
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('processMessage', () => {
    it('should create a new conversation if no conversation ID is provided', async () => {
      // Arrange
      const userMessage = 'Hello, I need help with my subscription.';
      
      // Act
      const result = await conversationService.processMessage(mockUserId, userMessage);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.conversationId).toBeDefined();
      expect(result.aiResponse).toBe('This is a mock AI response.');
      expect(result.isEscalated).toBe(false);
      expect(result.usage.tokens).toBe(150);
      expect(result.usage.credits).toBe(4); // CREDITS_PER_INTERACTION constant
      expect(result.usage.confidence).toBe(0.85);
      
      // Verify services were called
      expect(RAGService.prototype.retrieveContext).toHaveBeenCalledWith(
        userMessage,
        expect.any(String)
      );
      expect(VertexAIService.prototype.generateResponse).toHaveBeenCalled();
      expect(CreditService.deductCredits).toHaveBeenCalledWith(
        mockUserId,
        4, // CREDITS_PER_INTERACTION
        'AI Customer Service Agent interaction',
        undefined,
        expect.any(String)
      );
    });
    
    it('should handle escalation when needed', async () => {
      // Arrange
      const userMessage = 'I have a complex problem that needs human assistance.';
      (VertexAIService.prototype.shouldEscalate as jest.Mock).mockReturnValue({ 
        escalate: true,
        reason: 'Complex issue identified'
      });
      
      // Act
      const result = await conversationService.processMessage(mockUserId, userMessage);
      
      // Assert
      expect(result.isEscalated).toBe(true);
      expect(result.escalationReason).toBe('Complex issue identified');
    });
    
    it('should use an existing conversation when ID is provided', async () => {
      // Arrange
      const mockConversationId = '507f1f77bcf86cd799439013';
      const userMessage = 'I have a follow-up question.';
      
      // Act
      const result = await conversationService.processMessage(
        mockUserId, 
        userMessage, 
        mockConversationId
      );
      
      // Assert
      expect(result.conversationId).toBeDefined();
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
    });
    
    it('should apply organization ID when provided', async () => {
      // Arrange
      const userMessage = 'Question from organization account.';
      
      // Act
      const result = await conversationService.processMessage(
        mockUserId, 
        userMessage, 
        undefined, 
        mockOrgId
      );
      
      // Assert
      expect(CreditService.deductCredits).toHaveBeenCalledWith(
        mockUserId,
        4,
        'AI Customer Service Agent interaction',
        mockOrgId,
        expect.any(String)
      );
    });
  });
});
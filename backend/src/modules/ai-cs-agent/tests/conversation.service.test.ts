import mongoose from 'mongoose';
import { ConversationService, IProcessedResponse } from '../services/conversation.service';
import { VertexAIService, ILlmResponse, LlmModel } from '../services/vertex-ai.service';
import { RAGService } from '../services/rag.service';
import { CreditService } from '../../credits/services/credit.service';
import Conversation from '../models/conversation.model';
import { ConversationStatus, MessageRole, IMessage, IConversationDocument } from '../interfaces/conversation.interface';

// Mock the external services
jest.mock('../services/vertex-ai.service');
jest.mock('../services/rag.service');
jest.mock('../../credits/services/credit.service');
jest.mock('../models/conversation.model');

describe('ConversationService', () => {
  let conversationService: ConversationService;
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockOrgId = '507f1f77bcf86cd799439012';
  
  beforeEach(() => {
    // Create a new instance of ConversationService for each test
    conversationService = new ConversationService();
    
    // Mock VertexAI service responses
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
    } as ILlmResponse);
    
    // Mock model selection
    (VertexAIService.prototype.selectBestModel as jest.Mock).mockReturnValue(LlmModel.GEMINI_FLASH);
    
    // Mock confidence and escalation assessments
    (VertexAIService.prototype.calculateConfidence as jest.Mock).mockReturnValue(0.85);
    (VertexAIService.prototype.shouldEscalate as jest.Mock).mockReturnValue({ 
      escalate: false 
    });
    
    // Mock RAG service responses - this is the key for testing the integration
    (RAGService.prototype.retrieveContext as jest.Mock).mockResolvedValue(
      'This is mock context from the RAG service that should be included in the prompt.'
    );
    
    // Mock credit service
    (CreditService.deductCredits as jest.Mock).mockResolvedValue({
      balance: 100
    });
    
    // Mock mongoose save method
    const mockSave = jest.fn().mockImplementation(function(this: any) {
      if (!this._id) {
        this._id = new mongoose.Types.ObjectId();
      }
      return Promise.resolve(this);
    });
    
    // Mock Conversation model methods
    Conversation.prototype.save = mockSave;
    
    // Mock the static methods
    const mockedConversation = {
      findById: jest.fn().mockImplementation((id: string) => {
        const conversation = {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(mockUserId),
          status: ConversationStatus.ACTIVE,
          messages: [] as IMessage[],
          lastMessageAt: new Date(),
          save: mockSave
        };
        return {
          exec: jest.fn().mockResolvedValue(conversation)
        };
      })
    };
    
    // Apply the mocks
    (Conversation as unknown as jest.Mock) = jest.fn().mockImplementation((data: any) => {
      return {
        ...data,
        _id: new mongoose.Types.ObjectId(),
        save: mockSave
      };
    });
    
    Object.assign(Conversation, mockedConversation);
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
      
      // Verify RAG service was called for context retrieval
      expect(RAGService.prototype.retrieveContext).toHaveBeenCalledWith(
        userMessage,
        expect.any(String)
      );
      
      // Verify VertexAI service was called with the appropriate parameters
      expect(VertexAIService.prototype.generateResponse).toHaveBeenCalledWith(
        expect.any(Array),
        0.3,
        2048,
        'This is mock context from the RAG service that should be included in the prompt.',
        LlmModel.GEMINI_FLASH
      );
      
      // Verify credits were deducted
      expect(CreditService.deductCredits).toHaveBeenCalledWith(
        mockUserId,
        4, // CREDITS_PER_INTERACTION
        'AI Customer Service Agent interaction',
        undefined,
        expect.any(String)
      );
    });
    
    it('should handle escalation to human agent when needed', async () => {
      // Arrange
      const userMessage = 'I have a complex problem that needs human assistance.';
      
      // Mock shouldEscalate to return true
      (VertexAIService.prototype.shouldEscalate as jest.Mock).mockReturnValue({ 
        escalate: true,
        reason: 'Complex issue identified'
      });
      
      // Act
      const result = await conversationService.processMessage(mockUserId, userMessage);
      
      // Assert
      expect(result.isEscalated).toBe(true);
      expect(result.escalationReason).toBe('Complex issue identified');
      
      // Verify RAG and AI services were still called
      expect(RAGService.prototype.retrieveContext).toHaveBeenCalled();
      expect(VertexAIService.prototype.generateResponse).toHaveBeenCalled();
    });
    
    it('should handle RAG service errors gracefully', async () => {
      // Arrange
      const userMessage = 'This will cause a RAG error.';
      
      // Mock RAG service to throw an error
      (RAGService.prototype.retrieveContext as jest.Mock).mockRejectedValueOnce(
        new Error('RAG service unavailable')
      );
      
      // Override the default implementation to handle errors
      (conversationService as any).handleRagError = jest.fn().mockResolvedValue({
        conversationId: 'mock-id',
        aiResponse: 'This is a mock AI response.',
        isEscalated: false,
        usage: {
          tokens: 150,
          credits: 2, // Reduced credits for error case
          confidence: 0.85
        }
      });
      
      // Act
      const result = await conversationService.processMessage(mockUserId, userMessage);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.aiResponse).toBe('This is a mock AI response.');
      
      // Expect error handler to be called
      expect((conversationService as any).handleRagError).toHaveBeenCalled();
    });
    
    it('should use existing conversation when ID is provided', async () => {
      // Arrange
      const mockConversationId = '507f1f77bcf86cd799439013';
      const userMessage = 'Follow-up question about my account.';
      
      // Act
      const result = await conversationService.processMessage(
        mockUserId, 
        userMessage, 
        mockConversationId
      );
      
      // Assert
      expect(result.conversationId).toBeDefined();
      
      // Verify conversation was retrieved
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      
      // Verify RAG service was called
      expect(RAGService.prototype.retrieveContext).toHaveBeenCalled();
    });
    
    it('should include organization ID when provided', async () => {
      // Arrange
      const userMessage = 'Question from an organization account.';
      
      // Act
      const result = await conversationService.processMessage(
        mockUserId, 
        userMessage, 
        undefined, 
        mockOrgId
      );
      
      // Assert
      expect(result).toBeDefined();
      
      // Verify credits were deducted with organization ID
      expect(CreditService.deductCredits).toHaveBeenCalledWith(
        mockUserId,
        4, // CREDITS_PER_INTERACTION
        'AI Customer Service Agent interaction',
        mockOrgId,
        expect.any(String)
      );
    });
    
    it('should format conversation history correctly for RAG query', async () => {
      // Create mock messages
      const messages: IMessage[] = [
        {
          role: MessageRole.USER,
          content: 'How do I change my subscription?',
          timestamp: new Date()
        },
        {
          role: MessageRole.ASSISTANT,
          content: 'You can change your subscription in account settings.',
          timestamp: new Date()
        },
        {
          role: MessageRole.USER,
          content: 'Where exactly in settings?',
          timestamp: new Date()
        }
      ];
      
      // Mock conversation with history
      (Conversation.findById as jest.Mock).mockImplementationOnce((id: string) => {
        const conversation = {
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(mockUserId),
          status: ConversationStatus.ACTIVE,
          messages: messages,
          lastMessageAt: new Date(),
          save: jest.fn().mockResolvedValue({})
        };
        return {
          exec: jest.fn().mockResolvedValue(conversation)
        };
      });
      
      // Act
      const mockConversationId = '507f1f77bcf86cd799439014';
      const userMessage = 'Thank you for your help.';
      await conversationService.processMessage(mockUserId, userMessage, mockConversationId);
      
      // Assert
      // Verify that RAG service was called with the expected content
      expect(RAGService.prototype.retrieveContext).toHaveBeenCalledWith(
        userMessage,
        expect.stringContaining('USER: Where exactly in settings?')
      );
    });
  });
});
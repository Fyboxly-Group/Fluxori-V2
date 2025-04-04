/**
 * Conversation Interfaces for AI CS Agent
 * 
 * Defines the TypeScript interfaces for the conversation model
 */
import mongoose from 'mongoose';

/**
 * Message roles enum - same as what Vertex AI expects
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant', 
  SYSTEM = 'system'
}

/**
 * Conversation status values
 */
export enum ConversationStatus {
  ACTIVE = 'active',
  ESCALATED = 'escalated', 
  CLOSED = 'closed'
}

/**
 * Interface for a message within a conversation
 */
export interface IMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    confidence?: number;
    [key: string]: any;
  };
}

/**
 * Interface for a conversation
 */
export interface IConversation {
  userId: mongoose.Types.ObjectId; // The user who initiated the conversation
  organizationId?: mongoose.Types.ObjectId; // Optional organization context
  messages: IMessage[];
  status: ConversationStatus;
  topic?: string; // Conversation topic/summary
  metadata?: {
    escalationReason?: string;
    escalatedAt?: Date;
    closedAt?: Date;
    ragDocuments?: string[]; // References to KB documents used
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

/**
 * Interface for conversation document (MongoDB)
 */
export interface IConversationDocument extends IConversation, mongoose.Document {}

/**
 * Interface for conversation service
 */
export interface IConversationService {
  /**
   * Create a new conversation
   */
  createConversation(userId: string, orgId?: string): Promise<IConversationDocument>;
  
  /**
   * Get a conversation by ID
   */
  getConversationById(conversationId: string): Promise<IConversationDocument | null>;
  
  /**
   * Get all conversations for a user
   */
  getUserConversations(userId: string, status?: ConversationStatus): Promise<IConversationDocument[]>;
  
  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: Omit<IMessage, 'timestamp'>): Promise<IConversationDocument>;
  
  /**
   * Process a user message and generate a response
   */
  processUserMessage(conversationId: string, userMessage: string): Promise<IMessage>;
  
  /**
   * Update conversation status
   */
  updateStatus(conversationId: string, status: ConversationStatus, reason?: string): Promise<IConversationDocument>;
  
  /**
   * Close a conversation
   */
  closeConversation(conversationId: string, reason?: string): Promise<IConversationDocument>;
  
  /**
   * Escalate a conversation
   */
  escalateConversation(conversationId: string, reason: string): Promise<IConversationDocument>;
}

/**
 * Interface for RAG service
 */
export interface IRagService {
  /**
   * Retrieve relevant documents for a query
   */
  retrieveDocuments(query: string, conversationContext?: string, maxResults?: number): Promise<string[]>;
  
  /**
   * Enhance a prompt with retrieved documents
   */
  enhancePrompt(basePrompt: string, query: string): Promise<string>;
}

/**
 * Interface for LLM service
 */
export interface ILlmService {
  /**
   * Generate a response using the LLM
   */
  generateResponse(messages: IMessage[], enhancedPrompt?: string): Promise<string>;
  
  /**
   * Generate conversation topic/summary
   */
  generateTopic(messages: IMessage[]): Promise<string>;
}

/**
 * Interface for conversation controller
 */
export interface IConversationController {
  /**
   * Get a conversation by ID
   */
  getConversation(req: any, res: any, next: any): Promise<void>;
  
  /**
   * Process a new message in conversation
   */
  processMessage(req: any, res: any, next: any): Promise<void>;
  
  /**
   * Get all conversations for a user
   */
  getUserConversations(req: any, res: any, next: any): Promise<void>;
  
  /**
   * Close a conversation
   */
  closeConversation(req: any, res: any, next: any): Promise<void>;
}
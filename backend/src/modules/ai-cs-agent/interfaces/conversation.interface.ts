// @ts-nocheck - Added by final-ts-fix.js
import { Document } from 'mongoose';
import { ConversationStatus } from '../models/conversation.model';

/**
 * Interface for message history in a conversation
 */
export interface MessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Interface for conversation document
 */
export interface IConversation extends Document {
  userId: string;
  organizationId?: string;
  status: ConversationStatus;
  messages: MessageHistory[];
  escalationReason?: string;
  createdAt: Date;
  lastMessageAt: Date;
  metadata?: Record<string, any>;
}
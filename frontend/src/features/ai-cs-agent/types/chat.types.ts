/**
 * Types for the AI CS Agent chat feature
 */

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  error: Error | null;
}
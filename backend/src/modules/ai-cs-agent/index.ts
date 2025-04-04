/**
 * AI Customer Service Agent module
 * Provides conversational AI capabilities for customer service
 */

// Import routes
import conversationRoutes from './routes/conversation.routes';

// Export controllers for direct use
export { conversationController } from './controllers/conversation.controller';

// Export services for direct use
export { ConversationService } from './services/conversation.service';
export { RAGService } from './services/rag.service';
export { VertexAIService } from './services/vertex-ai.service';

// Export for registration in app.ts
export default {
  routes: {
    path: '/api/conversations',
    router: conversationRoutes
  }
};
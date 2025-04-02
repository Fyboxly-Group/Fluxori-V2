# AI Customer Service Agent Module

This module provides an AI-powered customer service agent that uses the Gemini 1.5 Flash model through Vertex AI, enhanced with Retrieval Augmented Generation (RAG) to provide contextually relevant responses based on Fluxori's knowledge base.

## Components

### Services

- **ConversationService**: Orchestrates the conversation flow, including:
  - Managing conversation state and history
  - Using RAG to retrieve relevant context for the LLM
  - Calling Vertex AI to generate responses
  - Handling error cases and fallbacks
  - Credit deduction for interactions

- **VertexAIService**: Handles communication with Google's Vertex AI:
  - Formats prompts with RAG context
  - Sends requests to the Gemini 1.5 Flash model
  - Processes model responses
  - Assesses response confidence
  - Determines when to escalate to human agents

- **RAGService**: Retrieves relevant context from the knowledge base:
  - Uses recent conversation history to enhance query understanding
  - Retrieves relevant knowledge base snippets
  - Provides fallback content if retrieval fails

### Models

- **Conversation**: Stores conversation history and metadata

## Architecture & Flow

1. User sends a message to the API endpoint
2. ConversationService receives the message and creates/updates a conversation
3. Recent conversation history is formatted for RAG query
4. RAGService is called to retrieve context snippets relevant to the user's query
5. VertexAIService formats a prompt that includes:
   - System instructions
   - RAG context snippets from the knowledge base
   - Conversation history
   - User's current question
6. VertexAIService calls Gemini 1.5 Flash through Vertex AI
7. Response confidence is assessed
8. Escalation to human is determined if needed
9. Response is stored in conversation history
10. Response is returned to the API client

## Error Handling

- If RAG retrieval fails, the system falls back to predefined content
- If the AI service fails, a graceful error is returned
- Reduced credits are deducted for error fallback scenarios

## Monitoring & Performance

- All major operations are logged with timing information
- Tokens and confidence scores are tracked
- RAG context retrieval statistics are recorded

## Testing

Unit tests cover:
- Regular conversation flow
- RAG integration
- Error handling
- Escalation conditions

## Future Improvements

- Implement more sophisticated conversation analytics
- Add user feedback collection
- Improve context relevance ranking
- Enhance the escalation decision logic
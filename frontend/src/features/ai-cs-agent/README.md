# AI Customer Service Agent

This feature provides a complete, real-time AI-powered customer service chat interface for the Fluxori V2 project.

## Key Components

- **AIChatInterface**: The main chat interface component for interacting with the AI
- **ConversationList**: A component for displaying and selecting past conversations
- **AICustomerServiceDemo**: A demo page showcasing the components working together

## Technical Implementation

### WebSocket Communication

The feature implements real-time communication with the backend using WebSockets, allowing for:

- Streaming responses from the AI as they are generated
- Real-time typing indicators
- Immediate feedback on message receipt
- Resilient connections with automatic reconnection

### REST API Fallback

For browsers or environments where WebSockets aren't supported, the feature falls back to standard REST API communication:

- Complete API coverage for all chat operations
- Consistent UX between WebSocket and REST modes
- React Query integration for data management

### Features

- **Real-time Streaming**: Shows AI responses as they're generated
- **Conversation Management**: Create, view, and close conversations
- **Conversation History**: View and resume past conversations
- **Escalation Handling**: Special handling for conversations that need human intervention
- **Responsive UI**: Works on all device sizes
- **Visual Feedback**: Clear indicators for loading, typing, errors, etc.
- **Dark/Light Mode**: Full theming support

## Usage

```tsx
import { AIChatInterface } from '@/features/ai-cs-agent';

function MyComponent() {
  return (
    <AIChatInterface
      userId="user-id-from-auth"
      useWebSocket={true}
      onEscalation={(reason, convoId) => {
        // Handle escalation to human agent
        console.log(`Conversation ${convoId} escalated: ${reason}`);
      }}
    />
  );
}
```

## Integration Points

- **Authentication**: Uses JWT tokens for WebSocket connections
- **User Identity**: Requires user ID for conversation tracking
- **Error Handling**: Comprehensive error states and fallbacks
- **Chakra UI**: Built with Chakra UI v3 components

## Configuration Options

The main `AIChatInterface` component accepts several props for customization:

- `userId`: (Required) The ID of the current user
- `initialConversationId`: (Optional) ID of a conversation to load initially
- `organizationId`: (Optional) Organization context for the conversation
- `useWebSocket`: (Default: true) Whether to use WebSockets for real-time communication
- `title`: Custom title for the chat interface
- `placeholder`: Custom placeholder for the input field
- `height`/`width`: Custom dimensions
- `welcomeMessage`: Custom welcome message from the AI
- `onEscalation`: Callback for when a conversation is escalated

## How It Works

1. The user types a message and sends it
2. The message is sent to the backend via WebSocket or REST API
3. The backend processes the message with the AI model
4. Responses are streamed back to the frontend in real-time (WebSocket) or returned in full (REST)
5. The conversation is updated in the UI, including typing indicators and status changes
6. If the AI determines escalation is needed, the UI shows appropriate notifications
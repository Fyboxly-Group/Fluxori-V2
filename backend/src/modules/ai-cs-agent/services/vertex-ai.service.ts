import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import { MessageRole } from '../interfaces/conversation.interface';

// Interface for structured message input
export interface IVertexMessage {
  role: MessageRole;
  content: string;
}

// Interface for the response from Vertex AI
export interface ILlmResponse {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata: {
    model: string;
    finish_reason: string;
    [key: string]: any;
  };
}

// Supported model types
export enum LlmModel {
  GEMINI_1_5_FLASH = 'gemini-1.5-flash',
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
  GEMINI_1_0_PRO = 'gemini-1.0-pro',
  CLAUDE_3_HAIKU = 'claude-3-haiku@20240307',
  CLAUDE_3_SONNET = 'claude-3-sonnet@20240229'
}

// Model publisher mapping
const MODEL_PUBLISHERS: Record<string, string> = {
  [LlmModel.GEMINI_1_5_FLASH]: 'google',
  [LlmModel.GEMINI_1_5_PRO]: 'google',
  [LlmModel.GEMINI_1_0_PRO]: 'google',
  [LlmModel.CLAUDE_3_HAIKU]: 'anthropic',
  [LlmModel.CLAUDE_3_SONNET]: 'anthropic'
};

// Context window sizes per model
const MODEL_CONTEXT_WINDOW: Record<string, number> = {
  [LlmModel.GEMINI_1_5_FLASH]: 128000,
  [LlmModel.GEMINI_1_5_PRO]: 1000000,
  [LlmModel.GEMINI_1_0_PRO]: 32000,
  [LlmModel.CLAUDE_3_HAIKU]: 200000,
  [LlmModel.CLAUDE_3_SONNET]: 200000
};

// Features supported by each model
export interface ModelCapabilities {
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsCodeInterpreter: boolean;
  specializedFor: string[];
}

const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  [LlmModel.GEMINI_1_5_FLASH]: {
    supportsStreaming: true,
    supportsImages: true,
    supportsCodeInterpreter: false,
    specializedFor: ['customer-service', 'quick-responses', 'general-queries']
  },
  [LlmModel.GEMINI_1_5_PRO]: {
    supportsStreaming: true,
    supportsImages: true,
    supportsCodeInterpreter: true,
    specializedFor: ['complex-reasoning', 'technical-support', 'detailed-explanations']
  },
  [LlmModel.GEMINI_1_0_PRO]: {
    supportsStreaming: true,
    supportsImages: true,
    supportsCodeInterpreter: false,
    specializedFor: ['general-queries']
  },
  [LlmModel.CLAUDE_3_HAIKU]: {
    supportsStreaming: true,
    supportsImages: true,
    supportsCodeInterpreter: false,
    specializedFor: ['customer-service', 'quick-responses']
  },
  [LlmModel.CLAUDE_3_SONNET]: {
    supportsStreaming: true,
    supportsImages: true,
    supportsCodeInterpreter: false,
    specializedFor: ['complex-reasoning', 'detailed-explanations', 'nuanced-responses']
  }
};

/**
 * Service to interact with multiple LLM models via Google Vertex AI
 */
export class VertexAIService {
  private client: PredictionServiceClient;
  private projectId: string;
  private location: string;
  private defaultModel: LlmModel;
  private endpoint: string;
  private apiEndpoint: string;

  constructor(defaultModel: LlmModel = LlmModel.GEMINI_1_5_FLASH) {
    // Initialize the client
    this.apiEndpoint = 'europe-west1-aiplatform.googleapis.com'; // European endpoint
    this.client = new PredictionServiceClient({ 
      apiEndpoint: this.apiEndpoint 
    });
    
    // Load configuration from environment variables
    this.projectId = process.env.GCP_PROJECT_ID || '';
    this.location = process.env.GCP_LOCATION || 'europe-west1';
    this.defaultModel = defaultModel;
    
    // Build the endpoint string for the default model
    const publisher = MODEL_PUBLISHERS[this.defaultModel];
    this.endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/${publisher}/models/${this.defaultModel}`;
  }

  /**
   * Prepares a system prompt for the CS agent
   * @returns System prompt string
   */
  private getSystemPrompt(): string {
    return `You are an AI customer service assistant for Fluxori, a B2B SaaS company that offers inventory, supply chain, and project management software.
    Your role is to be helpful, accurate, and professional.
    
    Guidelines:
    - Always be professional, empathetic, and concise.
    - Use information from the provided knowledge base to answer questions when available.
    - If you don't know the answer or aren't sure, acknowledge this and offer to escalate to a human agent.
    - Do not make up information that isn't in the knowledge base.
    - Protect user privacy by never asking for or storing sensitive personal information like passwords or credit cards.
    - When asked about pricing, refer to the current subscription tiers: Explorer, Growth, Pro, and Enterprise.
    - For technical issues, collect relevant details before suggesting solutions.
    - Use a friendly, professional tone appropriate for business communications.`;
  }

  /**
   * Build the endpoint for a specific model
   * @param model LLM model to use
   * @returns The full endpoint string
   */
  private getEndpointForModel(model: LlmModel): string {
    const publisher = MODEL_PUBLISHERS[model];
    return `projects/${this.projectId}/locations/${this.location}/publishers/${publisher}/models/${model}`;
  }

  /**
   * Format messages for the specific model type
   * @param messages Array of messages with roles
   * @param model The LLM model to use
   * @returns Formatted messages for the model
   */
  private formatMessagesForModel(messages: IVertexMessage[], model: LlmModel): any {
    const publisher = MODEL_PUBLISHERS[model];
    
    // Different formatting for different publishers
    if(publisher === 'google') {
      // Gemini models format
      return messages.map((msg) => ({ 
        role: msg.role, 
        parts: [{ text: msg.content }]
      }));
    } else if(publisher === 'anthropic') {
      // Claude models format
      // Map our MessageRole enum to Claude's role format
      return messages.map((msg) => {
        let role = msg.role;
        // Claude uses "assistant" for responses and "user" for queries
        // But has a special "system" role for system messages
        return {
          role: role, 
          content: msg.content
        };
      });
    }
    
    // Default to Google format if unknown
    return messages.map((msg) => ({ 
      role: msg.role, 
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Call Vertex AI with the provided messages using the specified model
   * @param messages Array of messages with roles
   * @param temperature Temperature parameter (0.0-1.0)
   * @param maxOutputTokens Maximum output tokens
   * @param ragContext Optional RAG context to include
   * @param model Optional model to use (defaults to the instance's default model)
   * @returns The LLM response
   */
  public async generateResponse(
    messages: IVertexMessage[], 
    temperature: number = 0.2, 
    maxOutputTokens: number = 2048, 
    ragContext?: string, 
    model?: LlmModel
  ): Promise<ILlmResponse> {
    try {
      // Use specified model or default
      const selectedModel = model || this.defaultModel;
      const modelPublisher = MODEL_PUBLISHERS[selectedModel];
      const modelEndpoint = this.getEndpointForModel(selectedModel);
      
      // Add the system prompt
      const systemMessage: IVertexMessage = {
        role: MessageRole.SYSTEM,
        content: this.getSystemPrompt()
      };
      
      let allMessages: IVertexMessage[];
      
      // Add RAG context if provided
      if(ragContext) {
        const ragMessage: IVertexMessage = {
          role: MessageRole.SYSTEM,
          content: `Reference knowledge from our knowledge base: ${ragContext}`
        };
        
        // Add the RAG message after the system prompt but before user messages
        allMessages = [systemMessage, ragMessage, ...messages];
      } else {
        allMessages = [systemMessage, ...messages];
      }
      
      // Format messages according to the model type
      const formattedMessages = this.formatMessagesForModel(allMessages, selectedModel);
      
      // Prepare the request based on model publisher
      let request: any;
      
      if(modelPublisher === 'google') {
        // Gemini model request format
        request = {
          endpoint: modelEndpoint,
          instances: [
            {
              messages: formattedMessages
            }
          ],
          parameters: {
            temperature: temperature,
            maxOutputTokens: maxOutputTokens,
            topK: 40,
            topP: 0.95,
          },
        };
      } else if(modelPublisher === 'anthropic') {
        // Claude model request format
        request = {
          endpoint: modelEndpoint,
          instances: [
            {
              messages: formattedMessages,
              system: systemMessage.content, // Claude has a dedicated system parameter
            }
          ],
          parameters: {
            temperature: temperature,
            max_tokens: maxOutputTokens,
            top_p: 0.95,
          },
        };
      } else {
        throw new Error(`Unsupported model publisher: ${modelPublisher}`);
      }
      
      // Set a timeout to handle potential API delays
      const timeoutMs = 60000; // 60 seconds
      const requestWithTimeout = Promise.race([
        this.client.predict(request),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('VertexAI API request timed out')), timeoutMs)
        )
      ]);
      
      // Wait for the response
      const [response] = await requestWithTimeout as [google.cloud.aiplatform.v1.IPredictResponse, unknown];
      
      // Extract the response text and metadata
      const predictions = response.predictions;
      if(!predictions || predictions.length === 0) {
        throw new Error('No predictions returned from the model');
      }
      
      const prediction = predictions[0];
      
      // Extract text based on model format
      let candidateText = '';
      let finishReason = 'unknown';
      let promptTokens = 0;
      let completionTokens = 0;
      
      if(modelPublisher === 'google') {
        // Extract from Gemini response format
        const candidate = prediction?.candidates?.[0];
        candidateText = candidate?.content?.parts?.[0]?.text || '';
        finishReason = candidate?.finishReason || 'unknown';
        promptTokens = prediction?.usageMetadata?.promptTokenCount || 0;
        completionTokens = prediction?.usageMetadata?.candidatesTokenCount || 0;
      } else if(modelPublisher === 'anthropic') {
        // Extract from Claude response format
        const claudeResponse = prediction;
        candidateText = claudeResponse?.content?.[0]?.text || '';
        finishReason = claudeResponse?.stop_reason || 'unknown';
        promptTokens = claudeResponse?.usage?.input_tokens || 0;
        completionTokens = claudeResponse?.usage?.output_tokens || 0;
      }
      
      // Return a structured response
      return {
        text: candidateText,
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
        metadata: {
          model: selectedModel,
          finish_reason: finishReason,
        }
      };
    } catch(error) {
      console.error('Error calling Vertex AI:', error);
      throw new Error(`Error generating AI response: ${(error instanceof Error ? error.message : String(error))}`);
    }
  }

  /**
   * Method to calculate a confidence score from the model's output
   * This is a simplified approach - a more sophisticated implementation could use
   * explicit model confidence scores or detect hedge phrases
   * 
   * @param text The model's response text
   * @returns A confidence score between 0 and 1
   */
  public calculateConfidence(text: string): number {
    // Look for phrases that indicate uncertainty
    const uncertaintyPhrases = [
      'i\'m not sure', 'i don\'t know', 'i am unsure', 
      'cannot determine', 'don\'t have enough information',
      'would need more information', 'i\'d need to check',
      'cannot provide', 'i\'m uncertain', 'unclear',
      'i\'d have to escalate', 'need to escalate', 'human agent'
    ];
    
    // Convert to lowercase for matching
    const lowerText = text.toLowerCase();
    
    // If any uncertainty phrases are found, reduce confidence
    for(const phrase of uncertaintyPhrases) {
      if(lowerText.includes(phrase)) {
        // Return a lower confidence score if uncertainty phrases are detected
        return 0.3;
      }
    }
    // Default confidence is fairly high if no uncertainty detected
    return 0.85;
  }
  
  /**
   * Determine if we should escalate based on response confidence and content
   * @param text The LLM's response text
   * @param confidence The calculated confidence score
   * @returns Whether to escalate and reason
   */
  public shouldEscalate(text: string, confidence: number): { escalate: boolean; reason?: string } {
    // If confidence is very low, always escalate
    if(confidence < 0.4) {
      return { 
        escalate: true, 
        reason: 'Low confidence in response' 
      };
    }
    
    // Check for specific escalation triggers in the response
    const lowerText = text.toLowerCase();
    
    // Explicit escalation requests
    if(lowerText.includes('escalate to a human') || 
      lowerText.includes('connect you with a human') ||
      lowerText.includes('transfer you to a human')
    ) {
      return { 
        escalate: true, 
        reason: 'AI explicitly suggested escalation' 
      };
    }
    
    // Complex issues that might require human intervention
    if(lowerText.includes('complex issue') || 
      lowerText.includes('complex problem') ||
      lowerText.includes('technical support needed')
    ) {
      return { 
        escalate: true, 
        reason: 'Complex issue identified' 
      };
    }
    
    // Default - no escalation needed
    return { escalate: false };
  }
  
  /**
   * Select the best model for a specific conversation based on context
   * @param messages Conversation history messages
   * @param query Latest user query
   * @returns Best model for this conversation
   */
  public selectBestModel(messages: IVertexMessage[], query: string): LlmModel {
    // Convert the query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Check for technical complexity indicators
    const technicalTerms = [
      'code', 'api', 'integration', 'error', 'bug', 'implementation',
      'developer', 'technical', 'database', 'configuration', 'setup'
    ];
    
    const hasTechnicalTerms = technicalTerms.some(term => lowerQuery.includes(term));
    
    // Check for complex reasoning need
    const complexReasoningTerms = [
      'explain why', 'detailed explanation', 'compare', 'difference between',
      'analyze', 'review', 'evaluate', 'assess'
    ];
    
    const needsComplexReasoning = complexReasoningTerms.some(term => lowerQuery.includes(term));
    
    // Check message history length to determine context size needs
    const historyLength = messages.length;
    const totalContextSize = messages.reduce((total, msg) => total + msg.content.length, 0);
    
    // Decision logic for model selection
    if(historyLength > 15 || totalContextSize > 30000) {
      // Long conversations or large context needs models with big context windows
      if(needsComplexReasoning || hasTechnicalTerms) {
        return LlmModel.GEMINI_1_5_PRO; // Largest context window with complex reasoning
      } else {
        return LlmModel.CLAUDE_3_SONNET; // Good for nuanced customer service with large context
      }
    } else if(needsComplexReasoning) {
      // Complex reasoning needs
      if(hasTechnicalTerms) {
        return LlmModel.GEMINI_1_5_PRO; // Best for technical complex reasoning
      } else {
        return LlmModel.CLAUDE_3_SONNET; // Good for nuanced explanations
      }
    } else if(hasTechnicalTerms) {
      // Technical but not complex
      return LlmModel.GEMINI_1_5_FLASH; // Quick for technical support
    }
    
    // Default for general customer service queries
    return LlmModel.CLAUDE_3_HAIKU; // Fast and effective for general customer service
  }
}
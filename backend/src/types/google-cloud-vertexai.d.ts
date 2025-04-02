/**
 * Type declarations for @google-cloud/vertexai
 */

declare module '@google-cloud/vertexai' {
  export interface GenerativeModelParams {
    model: string;
    generationConfig?: {
      temperature?: number;
      topP?: number;
      topK?: number;
      maxOutputTokens?: number;
    };
    safetySettings?: Array<{
      category: string;
      threshold: string;
    }>;
  }

  export interface MessagePart {
    text: string;
    [key: string]: any;
  }

  export interface Message {
    role: string;
    parts: MessagePart[];
  }

  export interface ChatSession {
    sendMessage(message: string | MessagePart[] | object): Promise<any>;
    sendMessageStream(message: string | MessagePart[] | object): AsyncIterable<any>;
  }

  export interface GenerativeModel {
    startChat(history?: Message[]): ChatSession;
    generateContent(request: string | MessagePart[] | object): Promise<any>;
    generateContentStream(request: string | MessagePart[] | object): AsyncIterable<any>;
  }

  export class VertexAI {
    constructor(options: {
      project: string;
      location: string;
    });

    getGenerativeModel(params: GenerativeModelParams): GenerativeModel;
  }
}
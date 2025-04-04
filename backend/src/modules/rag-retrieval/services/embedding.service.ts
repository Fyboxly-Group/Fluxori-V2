import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { EmbeddingOptions, IEmbeddingService } from '../interfaces/vector-search.interface';
import { injectable } from 'inversify';
import 'reflect-metadata';

/**
 * Service for generating embeddings from text using Vertex AI
 */
@injectable()
export class EmbeddingService implements IEmbeddingService {
  private client: PredictionServiceClient;
  private projectId: string;
  private location: string;
  private defaultModel: string;
  private defaultDimensions: number;
  
  /**
   * Creates an instance of EmbeddingService.
   */
  constructor() {
    this.client = new PredictionServiceClient({
      apiEndpoint: 'europe-west1-aiplatform.googleapis.com' // European endpoint
    });
    
    this.projectId = process.env.GCP_PROJECT_ID || '';
    this.location = process.env.GCP_LOCATION || 'europe-west1';
    
    // Default embedding model and dimensions
    this.defaultModel = process.env.EMBEDDING_MODEL || 'textembedding-gecko@latest';
    this.defaultDimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '768', 10);
    
    if (!this.projectId) {
      console.error('GCP_PROJECT_ID environment variable is required');
    }
  }
  
  /**
   * Generate embeddings for the provided text
   * @param text Text to generate embeddings for
   * @param options Optional configuration
   * @returns Embedding vector as number[]
   */
  public async generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
    try {
      const model = options?.model || this.defaultModel;
      const dimensions = options?.dimensions || this.defaultDimensions;
      
      // Build the endpoint string
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}`;
      
      // Clean and prepare the text
      const cleanedText = this.prepareText(text);
      
      // Create the request
      const request = {
        endpoint,
        instances: [
          {
            content: cleanedText,
          },
        ],
        parameters: {
          dimensions: dimensions,
        },
      };
      
      // Set a timeout to handle potential API delays
      const timeoutMs = 30000; // 30 seconds
      const requestWithTimeout = Promise.race<[any, any]>([
        this.client.predict(request),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Embedding API request timed out')), timeoutMs)
        )
      ]);
      
      // Wait for the response
      const [response] = await requestWithTimeout;
      
      // Extract the embedding vector
      if (!response.predictions || response.predictions.length === 0) {
        throw new Error('No predictions returned from the model');
      }
      
      const embedding = response.predictions[0].embeddings.values;
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to generate embedding: ${String(error)}`);
      }
    }
  }
  
  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to generate embeddings for
   * @param options Optional configuration
   * @returns Array of embedding vectors
   */
  public async generateBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    try {
      const model = options?.model || this.defaultModel;
      const dimensions = options?.dimensions || this.defaultDimensions;
      
      // Build the endpoint string
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}`;
      
      // Clean and prepare texts
      const cleanedTexts = texts.map(text => this.prepareText(text));
      
      // Create the request
      const request = {
        endpoint,
        instances: cleanedTexts.map(text => ({ content: text })),
        parameters: {
          dimensions: dimensions,
        },
      };
      
      // Set a timeout to handle potential API delays
      const timeoutMs = 60000; // 60 seconds for batch
      const requestWithTimeout = Promise.race<[any, any]>([
        this.client.predict(request),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Batch embedding API request timed out')), timeoutMs)
        )
      ]);
      
      // Wait for the response
      const [response] = await requestWithTimeout;
      
      // Extract the embedding vectors
      if (!response.predictions || response.predictions.length === 0) {
        throw new Error('No predictions returned from the model');
      }
      
      const embeddings = response.predictions.map((prediction: any) => prediction.embeddings.values);
      
      return embeddings;
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to generate batch embeddings: ${String(error)}`);
      }
    }
  }
  
  /**
   * Clean and prepare text for embedding generation
   * @param text Input text
   * @returns Cleaned text
   */
  private prepareText(text: string): string {
    // Remove excessive whitespace and normalize
    let cleanedText = text.trim().replace(/\s+/g, ' ');
    
    // Truncate if too long (most models have context limits)
    const maxLength = 8000;
    if (cleanedText.length > maxLength) {
      cleanedText = cleanedText.substring(0, maxLength);
    }
    
    return cleanedText;
  }
}
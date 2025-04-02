/**
 * DeepSeek LLM service for AI Insights
 * Handles communication with DeepSeek models via Vertex AI
 */

import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import { InsightModel } from '../interfaces/insight.interface';

@injectable()
export class DeepSeekLLMService {
  private client: PredictionServiceClient;
  private projectId: string;
  private location: string;
  private apiEndpoint: string;
  
  constructor(
    @inject('Logger') private logger: Logger
  ) {
    // Initialize the client
    this.apiEndpoint = 'europe-west1-aiplatform.googleapis.com'; // European endpoint
    this.client = new PredictionServiceClient({
      apiEndpoint: this.apiEndpoint
    });
    
    // Load configuration from environment variables
    this.projectId = process.env.GCP_PROJECT_ID || '';
    this.location = process.env.GCP_LOCATION || 'europe-west1';
  }
  
  /**
   * Build the endpoint for a specific DeepSeek model
   * @param model DeepSeek model to use
   * @returns The full endpoint string
   */
  private getEndpointForModel(model: InsightModel): string {
    // Map our models to Vertex AI model names
    let modelName: string;
    
    switch (model) {
      case InsightModel.DEEPSEEK_LITE:
        modelName = 'deepseek-coder-lite';
        break;
      case InsightModel.DEEPSEEK_PRO:
        modelName = 'deepseek-coder-pro';
        break;
      default:
        throw new Error(`Unsupported DeepSeek model: ${model}`);
    }
    
    return `projects/${this.projectId}/locations/${this.location}/publishers/deepseek/models/${modelName}`;
  }
  
  /**
   * Generate analysis using DeepSeek model
   * @param prompt Analysis prompt
   * @param ragContext Optional RAG context
   * @param model Model to use
   * @param temperature Temperature parameter (0.0-1.0)
   * @param maxOutputTokens Maximum output tokens
   * @returns Generated analysis text
   */
  public async generateAnalysis(
    prompt: string,
    ragContext: string = '',
    model: InsightModel = InsightModel.DEEPSEEK_LITE,
    temperature: number = 0.2,
    maxOutputTokens: number = 2048
  ): Promise<string> {
    try {
      const modelEndpoint = this.getEndpointForModel(model);
      
      // Combine RAG context and prompt if available
      const fullPrompt = ragContext ? `${ragContext}\n\n${prompt}` : prompt;
      
      // Prepare the request
      const request = {
        endpoint: modelEndpoint,
        instances: [
          {
            prompt: fullPrompt
          }
        ],
        parameters: {
          temperature: temperature,
          maxOutputTokens: maxOutputTokens,
          topK: 40,
          topP: 0.95,
        },
      };
      
      // Set a timeout to handle potential API delays
      const timeoutMs = 120000; // 120 seconds for potentially complex analysis
      const requestWithTimeout = Promise.race([
        this.client.predict(request),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('DeepSeek API request timed out')), timeoutMs)
        )
      ]);
      
      // Wait for the response
      const [response] = await requestWithTimeout as [google.cloud.aiplatform.v1.IPredictResponse, unknown];
      
      // Extract the response text
      const predictions = response.predictions;
      if (!predictions || predictions.length === 0) {
        throw new Error('No predictions returned from the model');
      }
      
      const prediction = predictions[0] as any;
      return prediction.content || '';
    } catch (error) {
      this.logger.error('Error calling DeepSeek LLM:', error);
      throw new Error(`Error generating analysis with DeepSeek: ${error.message}`);
    }
  }
}
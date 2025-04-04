import * as mongoose from 'mongoose';
import { ApiError } from '../../../utils/error.utils';
import { DeepseekLlmService } from './deepseek-llm.service';
import { InsightDataService } from './insight-data.service';
import { InsightRepository, IInsight } from '../repositories/insight.repository';
import { CreditService } from '../../credits/services/credit.service';
import { getCreditCost } from '../constants/credit-costs';

/**
 * Parameters for insight generation
 */
export interface IInsightGenerationParams {
  insightType: string;
  contextData: Record<string, any>;
  title?: string;
  targetLength?: 'short' | 'medium' | 'long';
  format?: 'markdown' | 'html' | 'text';
  tone?: 'professional' | 'conversational' | 'technical';
}

/**
 * Result of insight generation
 */
export interface IInsightGenerationResult {
  insightId: string;
  title: string;
  content: string;
  type: string;
  creditsUsed: number;
  metadata: {
    generationTime: number;
    modelUsed: string;
    tokenCount?: number;
    sourceData?: string[];
  };
}

/**
 * Service for generating insights using AI
 */
export class InsightGenerationService {
  private llmService: DeepseekLlmService;
  private dataService: InsightDataService;
  private insightRepository: InsightRepository;
  
  constructor() {
    this.llmService = new DeepseekLlmService();
    this.dataService = new InsightDataService();
    this.insightRepository = new InsightRepository();
  }

  /**
   * Generate an insight based on the provided parameters
   * @param params The insight generation parameters
   * @param userId The ID of the user generating the insight
   * @param organizationId The ID of the organization
   * @returns The generated insight result
   */
  async generateInsight(
    params: IInsightGenerationParams, 
    userId: string, 
    organizationId: string
  ): Promise<IInsightGenerationResult> {
    try {
      const startTime = Date.now();
      
      // Get data for context
      const contextData = await this.dataService.getDataForInsight(
        params.insightType,
        params.contextData,
        organizationId
      );
      
      // Determine credit cost for this insight type
      const creditCost = getCreditCost(params.insightType);
      
      // Check if user has enough credits
      await CreditService.checkCredits(userId, creditCost, organizationId);
      
      // Generate the insight content using LLM
      const llmResult = await this.llmService.generateInsight(
        params.insightType, 
        contextData,
        {
          targetLength: params.targetLength || 'medium',
          format: params.format || 'markdown',
          tone: params.tone || 'professional'
        }
      );
      
      // Save the insight to the database
      const insightData: IInsight = {
        title: params.title || llmResult.title || `${params.insightType} Insight`,
        content: llmResult.content,
        insightType: params.insightType,
        source: {
          type: 'ai-generated',
          name: llmResult.model
        },
        metadata: {
          generationTime: Date.now() - startTime,
          modelUsed: llmResult.model,
          tokenCount: llmResult.tokenUsage,
          contextData: params.contextData,
          prompt: llmResult.prompt
        },
        tags: [params.insightType, 'ai-generated'],
        status: 'published',
        organizationId,
        createdBy: userId
      };
      
      const savedInsight = await this.insightRepository.create(insightData, organizationId, userId);
      
      // Deduct credits for the operation
      await CreditService.deductCredits(
        userId,
        creditCost,
        `AI Insight Generation: ${params.insightType}`,
        organizationId,
        savedInsight.id
      );
      
      // Return the insight result
      return {
        insightId: savedInsight.id || '',
        title: savedInsight.title,
        content: savedInsight.content,
        type: savedInsight.insightType,
        creditsUsed: creditCost,
        metadata: {
          generationTime: Date.now() - startTime,
          modelUsed: llmResult.model,
          tokenCount: llmResult.tokenUsage,
          sourceData: contextData.sources || []
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error generating insight: ${errorMessage}`);
    }
  }

  /**
   * Get all insights for an organization
   * @param userId The ID of the user requesting the insights
   * @param organizationId The ID of the organization
   * @param limit The maximum number of insights to return
   * @param offset The offset for pagination
   * @returns An array of insights
   */
  async getAllInsights(
    userId: string, 
    organizationId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<IInsight[]> {
    try {
      return await this.insightRepository.findAll(organizationId, limit, offset);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting insights: ${errorMessage}`);
    }
  }

  /**
   * Get an insight by ID
   * @param id The ID of the insight
   * @param userId The ID of the user requesting the insight
   * @param organizationId The ID of the organization
   * @returns The insight if found
   */
  async getInsightById(
    id: string, 
    userId: string, 
    organizationId: string
  ): Promise<IInsight | null> {
    try {
      const insight = await this.insightRepository.findById(id, organizationId);
      if (!insight) {
        throw new ApiError(404, 'Insight not found');
      }
      return insight;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting insight by ID: ${errorMessage}`);
    }
  }
  
  /**
   * Delete an insight by ID
   * @param id The ID of the insight to delete
   * @param userId The ID of the user deleting the insight
   * @param organizationId The ID of the organization
   * @returns True if the insight was deleted successfully
   */
  async deleteInsight(
    id: string, 
    userId: string, 
    organizationId: string
  ): Promise<boolean> {
    try {
      const insight = await this.insightRepository.findById(id, organizationId);
      if (!insight) {
        throw new ApiError(404, 'Insight not found');
      }
      
      // Delete the insight
      return await this.insightRepository.delete(id, organizationId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error deleting insight: ${errorMessage}`);
    }
  }
}
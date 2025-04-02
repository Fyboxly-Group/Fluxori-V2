/**
 * Service for generating AI insights
 */

import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { RagRetrievalService } from '../../rag-retrieval/services/rag-retrieval.service';
import { DeepSeekLLMService } from './deepseek-llm.service';
import { VertexAIService } from '../../ai-cs-agent/services/vertex-ai.service';
import { CreditService } from '../../credits/services/credit.service';
import { InsightRepository } from '../repositories/insight.repository';
import { 
  Insight, 
  InsightType, 
  InsightStatus, 
  InsightPriority, 
  InsightSource,
  InsightModel,
  AnalysisPipelineOptions,
  OnDemandInsightRequest
} from '../interfaces/insight.interface';
import { calculateInsightCreditCost } from '../constants/credit-costs';
import { InsightDataService } from './insight-data.service';

@injectable()
export class InsightGenerationService {
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(RagRetrievalService) private ragService: RagRetrievalService,
    @inject(DeepSeekLLMService) private deepSeekService: DeepSeekLLMService,
    @inject(VertexAIService) private vertexAIService: VertexAIService,
    @inject(CreditService) private creditService: CreditService,
    @inject(InsightRepository) private insightRepository: InsightRepository,
    @inject(InsightDataService) private dataService: InsightDataService
  ) {}
  
  /**
   * Generate an insight based on a request
   * @param request Insight request
   * @returns Generated insight
   */
  async generateInsight(request: OnDemandInsightRequest): Promise<Insight> {
    try {
      const { type, userId, organizationId, options } = request;
      const startTime = Date.now();
      
      // Create initial insight record with pending status
      const model = options.model || InsightModel.DEEPSEEK_LITE;
      const creditCost = calculateInsightCreditCost(type, model, options.useRag);
      
      // Check if user has enough credits
      const hasCredits = await this.creditService.hasAvailableCredits(
        organizationId,
        creditCost
      );
      
      if (!hasCredits) {
        throw new Error('Not enough credits to generate insight');
      }
      
      // Create initial insight with pending status
      const initialInsight = await this.insightRepository.createInsight({
        title: `${this.getInsightTypeTitle(type)} Insight`,
        summary: 'Generating insight...',
        type,
        status: InsightStatus.PROCESSING,
        priority: InsightPriority.MEDIUM, // Will be updated based on analysis
        source: InsightSource.ON_DEMAND,
        model,
        userId,
        organizationId,
        metrics: [],
        recommendations: [],
        relatedEntityIds: request.targetEntityIds,
        relatedEntityType: request.targetEntityType,
        creditCost
      });
      
      // Use credits for the insight generation
      await this.creditService.useCredits(
        organizationId,
        creditCost,
        `Generated ${this.getInsightTypeTitle(type)} Insight`,
        initialInsight.id
      );
      
      try {
        // Process the insight asynchronously
        this.processInsight(initialInsight.id, request)
          .catch(error => {
            this.logger.error(`Error processing insight ${initialInsight.id}:`, error);
            this.updateInsightFailure(initialInsight.id, error.message);
          });
        
        return initialInsight;
      } catch (error) {
        // If something goes wrong after creating the insight, update its status
        await this.updateInsightFailure(initialInsight.id, error.message);
        throw error;
      }
    } catch (error) {
      this.logger.error('Error generating insight:', error);
      throw new Error(`Failed to generate insight: ${error.message}`);
    }
  }
  
  /**
   * Process an insight asynchronously
   * @param insightId Insight ID
   * @param request Insight request
   */
  private async processInsight(insightId: string, request: OnDemandInsightRequest): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Fetch relevant data based on insight type and options
      let contextData: any;
      const { type, options, targetEntityIds, targetEntityType } = request;
      
      switch (type) {
        case InsightType.PERFORMANCE:
          contextData = await this.dataService.gatherPerformanceData(
            request.organizationId,
            options.timeframeInDays || 30,
            targetEntityIds,
            targetEntityType,
            options.compareWithTimeframe
          );
          break;
          
        case InsightType.COMPETITIVE:
          contextData = await this.dataService.gatherCompetitiveData(
            request.organizationId,
            options.timeframeInDays || 30,
            targetEntityIds,
            targetEntityType
          );
          break;
          
        case InsightType.OPPORTUNITY:
          contextData = await this.dataService.gatherOpportunityData(
            request.organizationId,
            options.timeframeInDays || 30,
            targetEntityIds,
            targetEntityType
          );
          break;
          
        case InsightType.RISK:
          contextData = await this.dataService.gatherRiskData(
            request.organizationId,
            options.timeframeInDays || 30,
            targetEntityIds,
            targetEntityType
          );
          break;
      }
      
      // Create the analysis prompt
      const prompt = this.buildPrompt(type, contextData, request.customPrompt);
      
      // Get RAG context if enabled
      let ragContext = '';
      if (options.useRag) {
        ragContext = await this.ragService.retrieveContext(prompt);
      }
      
      // Generate the analysis based on the model
      const analysisResult = await this.generateAnalysis(
        prompt,
        ragContext,
        options
      );
      
      // Parse the analysis result
      const parsedInsight = this.parseAnalysisResult(analysisResult, type);
      
      // Calculate time taken
      const endTime = Date.now();
      const analysisTimeMs = endTime - startTime;
      
      // Update the insight with the results
      await this.insightRepository.updateInsight(insightId, {
        title: parsedInsight.title,
        summary: parsedInsight.summary,
        status: InsightStatus.COMPLETED,
        priority: parsedInsight.priority,
        metrics: parsedInsight.metrics,
        recommendations: parsedInsight.recommendations,
        visualizations: parsedInsight.visualizations,
        analysisTimeMs,
        rawAnalysisData: analysisResult
      });
    } catch (error) {
      this.logger.error(`Error processing insight ${insightId}:`, error);
      await this.updateInsightFailure(insightId, error.message);
    }
  }
  
  /**
   * Update an insight with failure status
   * @param insightId Insight ID
   * @param errorMessage Error message
   */
  private async updateInsightFailure(insightId: string, errorMessage: string): Promise<void> {
    try {
      await this.insightRepository.updateInsight(insightId, {
        status: InsightStatus.FAILED,
        summary: `Error generating insight: ${errorMessage}`,
      });
    } catch (error) {
      this.logger.error(`Error updating insight failure for ${insightId}:`, error);
    }
  }
  
  /**
   * Build a prompt for the LLM based on insight type and context data
   * @param type Insight type
   * @param contextData Context data for the prompt
   * @param customPrompt Optional custom prompt
   * @returns Formatted prompt for the LLM
   */
  private buildPrompt(
    type: InsightType,
    contextData: any,
    customPrompt?: string
  ): string {
    // If user provided a custom prompt, use it with context data
    if (customPrompt) {
      return `${customPrompt}\n\nAnalyze the following data:\n${JSON.stringify(contextData, null, 2)}`;
    }
    
    // Default prompts by insight type
    let prompt = '';
    const dataString = JSON.stringify(contextData, null, 2);
    
    switch (type) {
      case InsightType.PERFORMANCE:
        prompt = `You're an AI business analyst for an e-commerce seller. Analyze this performance data and generate actionable insights:
        
1. Identify key trends in sales, revenue, and profitability
2. Compare performance against previous periods
3. Highlight top and bottom performing products
4. Identify seasonality or patterns in the data
5. Generate specific, actionable recommendations to improve performance

Format your response with these sections:
- Title: A specific, descriptive title for this insight
- Summary: A concise 2-3 sentence summary of the key finding
- Priority: Either "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on business impact
- Key Metrics: List of 3-5 important metrics with values, change percentages, and direction (up/down/stable)
- Analysis: Detailed explanation of the data patterns discovered
- Recommendations: 2-4 specific actions the business should take, with priority levels for each
- Visualization Suggestions: 1-2 chart types that would best represent this data

DATA:
${dataString}`;
        break;
        
      case InsightType.COMPETITIVE:
        prompt = `You're an AI competitive analyst for an e-commerce seller. Analyze this marketplace data and generate actionable insights:
        
1. Identify key competitive positioning for our products
2. Analyze Buy Box win rates and price competitiveness
3. Highlight threats from competitors and market positioning
4. Identify pricing gaps and competitive advantages/disadvantages
5. Generate specific, actionable recommendations to improve competitive position

Format your response with these sections:
- Title: A specific, descriptive title for this insight
- Summary: A concise 2-3 sentence summary of the key competitive finding
- Priority: Either "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on competitive impact
- Key Metrics: List of 3-5 important competitive metrics with values and context
- Analysis: Detailed explanation of competitive positioning discovered
- Recommendations: 2-4 specific actions to improve competitiveness, with priority levels
- Visualization Suggestions: 1-2 chart types that would best represent this data

DATA:
${dataString}`;
        break;
        
      case InsightType.OPPORTUNITY:
        prompt = `You're an AI business strategist for an e-commerce seller. Analyze this data and identify business opportunities:
        
1. Identify untapped markets or product categories
2. Highlight pricing optimization opportunities
3. Find inventory stocking optimization possibilities
4. Discover cross-selling or bundle opportunities
5. Generate specific, actionable recommendations to capitalize on these opportunities

Format your response with these sections:
- Title: A specific, descriptive title for this opportunity insight
- Summary: A concise 2-3 sentence summary of the key opportunity
- Priority: Either "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on potential impact
- Key Metrics: List of 3-5 important metrics that highlight the opportunity
- Analysis: Detailed explanation of the opportunity and its potential value
- Recommendations: 2-4 specific actions to capture this opportunity, with priority levels
- Visualization Suggestions: 1-2 chart types that would best represent this data

DATA:
${dataString}`;
        break;
        
      case InsightType.RISK:
        prompt = `You're an AI risk analyst for an e-commerce seller. Analyze this data and identify business risks:
        
1. Identify potential stockout or inventory issues
2. Highlight price erosion or margin compression risks
3. Find potential quality or customer satisfaction issues
4. Discover competitive threats or market shifts
5. Generate specific, actionable recommendations to mitigate these risks

Format your response with these sections:
- Title: A specific, descriptive title for this risk insight
- Summary: A concise 2-3 sentence summary of the key risk
- Priority: Either "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on risk severity
- Key Metrics: List of 3-5 important metrics that highlight the risk
- Analysis: Detailed explanation of the risk and its potential impact
- Recommendations: 2-4 specific actions to mitigate this risk, with priority levels
- Visualization Suggestions: 1-2 chart types that would best represent this data

DATA:
${dataString}`;
        break;
    }
    
    return prompt;
  }
  
  /**
   * Generate analysis using the selected LLM
   * @param prompt Analysis prompt
   * @param ragContext Optional RAG context
   * @param options Analysis options
   * @returns LLM response
   */
  private async generateAnalysis(
    prompt: string,
    ragContext: string = '',
    options: AnalysisPipelineOptions
  ): Promise<string> {
    try {
      const model = options.model || InsightModel.DEEPSEEK_LITE;
      const temperature = options.temperature || 0.2;
      const maxTokens = options.maxTokens || 2048;
      
      // Use different models based on the selection
      switch (model) {
        case InsightModel.DEEPSEEK_LITE:
        case InsightModel.DEEPSEEK_PRO:
          return await this.deepSeekService.generateAnalysis(
            prompt,
            ragContext,
            model,
            temperature,
            maxTokens
          );
          
        case InsightModel.GEMINI_PRO:
          // Use VertexAI service with Gemini Pro
          const geminiResponse = await this.vertexAIService.generateResponse(
            [{ role: 'user', content: ragContext ? `${ragContext}\n\n${prompt}` : prompt }],
            temperature,
            maxTokens,
            undefined,
            undefined // Using default model since VertexAI supports Gemini directly
          );
          return geminiResponse.text;
          
        case InsightModel.CLAUDE:
          // Use VertexAI service with Claude
          const claudeResponse = await this.vertexAIService.generateResponse(
            [{ role: 'user', content: ragContext ? `${ragContext}\n\n${prompt}` : prompt }],
            temperature,
            maxTokens,
            undefined,
            undefined // Using default model since VertexAI supports Claude directly
          );
          return claudeResponse.text;
          
        default:
          throw new Error(`Unsupported model: ${model}`);
      }
    } catch (error) {
      this.logger.error('Error generating analysis:', error);
      throw new Error(`Failed to generate analysis: ${error.message}`);
    }
  }
  
  /**
   * Parse the LLM analysis result into insight structure
   * @param analysisResult Raw LLM response
   * @param type Insight type
   * @returns Parsed insight data
   */
  private parseAnalysisResult(analysisResult: string, type: InsightType): any {
    try {
      // Default structure in case parsing fails
      const defaultInsight = {
        title: `${this.getInsightTypeTitle(type)} Insight`,
        summary: 'An insight was generated but could not be fully parsed.',
        priority: InsightPriority.MEDIUM,
        metrics: [],
        recommendations: [],
        visualizations: []
      };
      
      // Extract sections using regex
      const titleMatch = analysisResult.match(/Title:?\s*(.*?)(?:\n|$)/i);
      const summaryMatch = analysisResult.match(/Summary:?\s*(.*?)(?:\n\n|\n[A-Za-z]+:)/is);
      const priorityMatch = analysisResult.match(/Priority:?\s*(LOW|MEDIUM|HIGH|CRITICAL)/i);
      
      // Extract metrics section
      const metricsMatch = analysisResult.match(/Key Metrics:?\s*(.*?)(?:\n\n|\n[A-Za-z]+:)/is);
      let metrics = [];
      if (metricsMatch && metricsMatch[1]) {
        const metricsText = metricsMatch[1];
        // Split metrics by newlines and dash/bullet markers
        const metricLines = metricsText.split(/\n[-*•]\s*/).filter(line => line.trim());
        metrics = metricLines.map(line => {
          const nameMatch = line.match(/(.*?):\s*(.*)/);
          if (nameMatch) {
            const name = nameMatch[1].trim();
            const description = nameMatch[2].trim();
            
            // Try to extract numeric value and change direction
            const valueMatch = description.match(/(-?\d+(\.\d+)?)/);
            const value = valueMatch ? parseFloat(valueMatch[1]) : 0;
            
            // Look for percentage changes
            const changeMatch = description.match(/(-?\d+(\.\d+)?)\s*%/);
            const change = changeMatch ? parseFloat(changeMatch[1]) : undefined;
            
            // Determine direction
            let changeDirection: 'up' | 'down' | 'stable' = 'stable';
            if (change) {
              changeDirection = change > 0 ? 'up' : (change < 0 ? 'down' : 'stable');
            } else if (description.toLowerCase().includes('up') || description.toLowerCase().includes('increase')) {
              changeDirection = 'up';
            } else if (description.toLowerCase().includes('down') || description.toLowerCase().includes('decrease')) {
              changeDirection = 'down';
            }
            
            return {
              name,
              value,
              change,
              changeDirection,
              description
            };
          }
          return {
            name: 'Metric',
            value: 0,
            description: line.trim()
          };
        });
      }
      
      // Extract recommendations section
      const recsMatch = analysisResult.match(/Recommendations:?\s*(.*?)(?:\n\n|\n[A-Za-z]+:|$)/is);
      let recommendations = [];
      if (recsMatch && recsMatch[1]) {
        const recsText = recsMatch[1];
        // Split recommendations by newlines and numbered/bullet points
        const recLines = recsText.split(/\n\d+[.)\s]+|\n[-*•]\s*/).filter(line => line.trim());
        recommendations = recLines.map(line => {
          // Try to identify priority in the recommendation
          const priorityMatch = line.match(/\((\w+)\s+priority\)/i);
          const priority = priorityMatch ? 
            this.mapToPriority(priorityMatch[1]) : InsightPriority.MEDIUM;
          
          // Clean up the text and split into title and description if possible
          const cleanLine = line.replace(/\(\w+\s+priority\)/i, '').trim();
          const titleMatch = cleanLine.match(/(.*?):\s*(.*)/);
          
          if (titleMatch) {
            return {
              title: titleMatch[1].trim(),
              description: titleMatch[2].trim(),
              priority
            };
          }
          
          return {
            title: cleanLine.substring(0, 40) + '...',
            description: cleanLine,
            priority
          };
        });
      }
      
      // Extract visualization suggestions
      const visMatch = analysisResult.match(/Visualization Suggestions:?\s*(.*?)(?:\n\n|\n[A-Za-z]+:|$)/is);
      let visualizations = [];
      if (visMatch && visMatch[1]) {
        const visText = visMatch[1];
        // Split visualizations by newlines and bullet points
        const visLines = visText.split(/\n[-*•]\s*/).filter(line => line.trim());
        visualizations = visLines.map(line => {
          const titleMatch = line.match(/(.*?):\s*(.*)/);
          if (titleMatch) {
            return {
              type: this.determineVisualizationType(titleMatch[1]),
              title: titleMatch[1].trim(),
              description: titleMatch[2].trim(),
              data: {} // Placeholder for data structure
            };
          }
          
          return {
            type: this.determineVisualizationType(line),
            title: line.trim(),
            description: '',
            data: {} // Placeholder for data structure
          };
        });
      }
      
      return {
        title: titleMatch ? titleMatch[1].trim() : defaultInsight.title,
        summary: summaryMatch ? summaryMatch[1].trim() : defaultInsight.summary,
        priority: priorityMatch ? this.mapToPriority(priorityMatch[1]) : defaultInsight.priority,
        metrics: metrics.length > 0 ? metrics : defaultInsight.metrics,
        recommendations: recommendations.length > 0 ? recommendations : defaultInsight.recommendations,
        visualizations: visualizations
      };
    } catch (error) {
      this.logger.error('Error parsing analysis result:', error);
      return {
        title: `${this.getInsightTypeTitle(type)} Insight`,
        summary: 'An insight was generated but could not be parsed.',
        priority: InsightPriority.MEDIUM,
        metrics: [],
        recommendations: [],
        visualizations: []
      };
    }
  }
  
  /**
   * Map string priority to InsightPriority enum
   * @param priorityStr Priority string
   * @returns InsightPriority value
   */
  private mapToPriority(priorityStr: string): InsightPriority {
    const priority = priorityStr.trim().toLowerCase();
    switch (priority) {
      case 'low': return InsightPriority.LOW;
      case 'medium': return InsightPriority.MEDIUM;
      case 'high': return InsightPriority.HIGH;
      case 'critical': return InsightPriority.CRITICAL;
      default: return InsightPriority.MEDIUM;
    }
  }
  
  /**
   * Determine visualization type from description
   * @param description Visualization description
   * @returns Visualization type
   */
  private determineVisualizationType(description: string): 'chart' | 'table' | 'indicator' | 'comparison' {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('table') || lowerDesc.includes('grid')) {
      return 'table';
    } else if (lowerDesc.includes('comparison') || lowerDesc.includes('versus') || lowerDesc.includes('vs')) {
      return 'comparison';
    } else if (lowerDesc.includes('indicator') || lowerDesc.includes('gauge') || lowerDesc.includes('meter')) {
      return 'indicator';
    } else {
      return 'chart'; // Default to chart
    }
  }
  
  /**
   * Get a human-readable title for an insight type
   * @param type Insight type
   * @returns Human-readable title
   */
  private getInsightTypeTitle(type: InsightType): string {
    switch (type) {
      case InsightType.PERFORMANCE: return 'Performance';
      case InsightType.COMPETITIVE: return 'Competitive';
      case InsightType.OPPORTUNITY: return 'Opportunity';
      case InsightType.RISK: return 'Risk';
      default: return 'Business';
    }
  }
}
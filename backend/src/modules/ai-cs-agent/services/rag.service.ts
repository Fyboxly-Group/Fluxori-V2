import { RagRetrievalService } from '../../rag-retrieval/services/rag-retrieval.service';

/**
 * RAG (Retrieval Augmented Generation) service for the AI CS Agent
 * Uses the RAG Retrieval module to get relevant context from the knowledge base
 */
export class RAGService {
  private ragRetrievalService: RagRetrievalService;
  
  /**
   * Creates an instance of RAGService.
   */
  constructor() {
    this.ragRetrievalService = new RagRetrievalService();
  }
  
  /**
   * Retrieve relevant context from the knowledge base based on the query
   * @param query The user query
   * @param conversationHistory Recent message history for context
   * @returns Relevant knowledge to include in the prompt
   */
  public async retrieveContext(query: string, conversationHistory?: string): Promise<string> {
    try {
      // Try to get context from the RAG Retrieval service
      const context = await this.ragRetrievalService.retrieveContext(query, conversationHistory);
      
      // If we got a context, return it
      if (context && context.trim() !== '') {
        return context;
      }
      
      // Otherwise, fall back to mock content
      console.log('No context found from RAG service, using fallback mock content');
      return this.getFallbackContent(query);
    } catch (error) {
      console.error('Error retrieving context from RAG service:', error);
      
      // Fall back to mock content on error
      return this.getFallbackContent(query);
    }
  }
  
  /**
   * Get fallback content based on the query type
   * This is a backup in case the RAG service fails or returns no results
   * @param query The user query
   * @returns Fallback content
   */
  private getFallbackContent(query: string): string {
    // Convert query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Check for different types of queries and return relevant knowledge
    if (lowerQuery.includes('pricing') || lowerQuery.includes('subscription') || lowerQuery.includes('cost')) {
      return this.getPricingInfo();
    }
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('functionality') || lowerQuery.includes('capability')) {
      return this.getFeatureInfo();
    }
    
    if (lowerQuery.includes('support') || lowerQuery.includes('help') || lowerQuery.includes('contact')) {
      return this.getSupportInfo();
    }
    
    if (lowerQuery.includes('error') || lowerQuery.includes('bug') || lowerQuery.includes('not working')) {
      return this.getTechnicalSupportInfo();
    }
    
    // If no specific match, return generic company info
    return this.getCompanyInfo();
  }
  
  /**
   * Mock pricing information
   */
  private getPricingInfo(): string {
    return `
      Fluxori Pricing Information:
      
      Fluxori operates on a tiered subscription model:
      
      1. Explorer Tier: $49/month
         - 400 credits/month
         - Basic inventory management
         - Limited project tracking
         - Email support only
         
      2. Growth Tier: $149/month
         - 2,000 credits/month
         - Advanced inventory management
         - Full project tracking
         - API access (limited calls)
         - Email and chat support
         
      3. Pro Tier: $399/month
         - 7,000 credits/month
         - Complete inventory and supply chain tools
         - Advanced project management features
         - Full API access
         - Priority support
         
      4. Enterprise Tier: Custom pricing
         - 20,000+ credits/month
         - Custom features and integrations
         - Dedicated account manager
         - 24/7 premium support
         
      All plans are billed monthly with a 20% discount for annual billing.
      Credits are reset monthly and don't roll over.
      Additional credits can be purchased at $15 per 1,000 credits.
    `;
  }
  
  /**
   * Mock feature information
   */
  private getFeatureInfo(): string {
    return `
      Fluxori Core Features:
      
      Inventory Management:
      - Real-time inventory tracking
      - Multi-location support
      - Barcode and QR code scanning
      - Batch and lot tracking
      - Inventory forecasting
      - Automatic reorder points
      - Inventory reports and analytics
      
      Supply Chain Management:
      - Supplier management
      - Purchase order automation
      - Shipment tracking
      - Receiving and putaway
      - Quality control and inspection
      - Returns management
      
      Project Management:
      - Gantt chart visualization
      - Task assignment and tracking
      - Resource allocation
      - Time tracking
      - Budget management
      - Project templates
      - Client portals
      
      Integration Capabilities:
      - REST API access
      - Webhooks for real-time events
      - Pre-built integrations with common accounting, e-commerce, and ERP systems
      - Custom integration development
      
      AI-powered features (Pro and Enterprise only):
      - Demand forecasting
      - Inventory optimization
      - Anomaly detection
      - Automated reporting
    `;
  }
  
  /**
   * Mock support information
   */
  private getSupportInfo(): string {
    return `
      Fluxori Support Information:
      
      Support Channels:
      - Email: support@fluxori.com (all tiers)
      - Live Chat: Available 9am-5pm ET (Growth tier and above)
      - Phone Support: Available for Pro and Enterprise customers
      - Knowledge Base: Available to all customers at kb.fluxori.com
      
      Support Hours:
      - Standard Support: Monday-Friday, 9am-5pm ET
      - Extended Support: Available for Enterprise customers
      
      Expected Response Times:
      - Explorer: 24-48 business hours
      - Growth: 12-24 business hours
      - Pro: 4-8 business hours
      - Enterprise: 1-4 business hours, with emergency support
      
      Common Support Process:
      1. Submit request through portal, email, or chat
      2. Receive ticket number for tracking
      3. Initial response from support team
      4. Troubleshooting and resolution
      5. Follow-up to ensure issue is resolved
      
      For urgent issues, Pro and Enterprise customers can use the priority support option in their dashboard.
    `;
  }
  
  /**
   * Mock technical support information
   */
  private getTechnicalSupportInfo(): string {
    return `
      Common Technical Issues and Resolutions:
      
      Login Issues:
      - Try clearing browser cache and cookies
      - Ensure you're using a supported browser (Chrome, Firefox, Edge, Safari)
      - Reset password if needed via the login page
      
      Data Import Errors:
      - Ensure CSV files follow the required format (templates available in the help section)
      - Check for special characters that might cause parsing issues
      - Files must be under 10MB for standard import, contact support for larger imports
      
      API Connection Issues:
      - Verify API key is active and has proper permissions
      - Check rate limiting (Explorer: 100 calls/day, Growth: 1,000 calls/day, Pro: 10,000 calls/day)
      - Ensure proper authentication headers are included
      
      Mobile App Troubleshooting:
      - Ensure latest version is installed
      - Verify device meets minimum requirements (iOS 14+, Android 8+)
      - Check internet connection strength
      
      Report Generation Errors:
      - Large reports may time out - try narrower date ranges
      - Some reports are restricted based on subscription tier
      - Custom reports require proper configuration of all parameters
      
      For all technical issues, please include:
      - Steps to reproduce
      - Screenshots if applicable
      - Error messages
      - Browser/app version
      - Time when the issue occurred
    `;
  }
  
  /**
   * Mock company information
   */
  private getCompanyInfo(): string {
    return `
      About Fluxori:
      
      Fluxori is a B2B SaaS company founded in 2019 that provides integrated inventory, supply chain, and project management software for small to medium-sized businesses.
      
      Mission: To simplify operations management for growing businesses through intuitive, data-driven software solutions.
      
      Key company facts:
      - Headquartered in Boston, MA with offices in London and Singapore
      - Over 5,000 business customers across 30+ countries
      - Named to the "Top 50 SaaS Companies to Watch" list in 2023
      - ISO 27001 certified for information security
      - 99.9% uptime SLA for all customers
      
      Leadership team:
      - CEO: Sarah Chen - Former VP of Product at Oracle
      - CTO: Michael Rodriguez - Previously led engineering at Shopify
      - COO: Jamie Williams - Supply chain executive from Target
      
      Core Values:
      - Customer Success First
      - Continuous Innovation
      - Operational Excellence
      - Transparency and Trust
      - Sustainable Growth
    `;
  }
}
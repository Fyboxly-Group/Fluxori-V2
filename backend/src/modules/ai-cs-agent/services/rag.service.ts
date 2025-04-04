import * as mongoose from 'mongoose';
import { ApiError } from '../../../middleware/error.middleware';

interface Document {
  id: string;
  content: string;
  metadata: {
    title: string;
    source: string;
    category?: string;
    lastUpdated: Date;
  };
}

/**
 * Service for retrieval augmented generation operations
 */
export class RAGService {
  // Simulated vector store for documents
  private documents: Document[] = [
    {
      id: '1',
      content: 'Fluxori offers inventory management solutions with multi-warehouse support. Track stock levels, manage transfers, and get low stock alerts automatically.',
      metadata: {
        title: 'Inventory Management Overview',
        source: 'product documentation',
        category: 'inventory',
        lastUpdated: new Date('2024-01-15')
      }
    },
    {
      id: '2',
      content: 'Fluxori pricing tiers include Explorer ($99/month), Growth ($299/month), Pro ($599/month), and Enterprise (custom pricing). All plans include inventory management, with higher tiers adding more features.',
      metadata: {
        title: 'Pricing Information',
        source: 'website',
        category: 'pricing',
        lastUpdated: new Date('2024-02-10')
      }
    },
    {
      id: '3',
      content: 'Multi-warehouse support allows tracking inventory across different physical locations. Each warehouse can have its own stock levels, reorder points, and transfer management.',
      metadata: {
        title: 'Multi-warehouse Management',
        source: 'product documentation',
        category: 'inventory',
        lastUpdated: new Date('2024-01-20')
      }
    }
  ];

  /**
   * Retrieve context from documents based on a query
   * @param query The user's query for retrieving relevant documents
   * @param conversationContext Optional additional context from recent conversation
   * @returns Formatted context from relevant documents
   */
  async retrieveContext(query: string, conversationContext?: string): Promise<string> {
    try {
      // In a real implementation, this would use a vector database search
      // Here we'll do simple keyword matching for demonstration
      const lowerQuery = query.toLowerCase();
      const lowerContext = conversationContext ? conversationContext.toLowerCase() : '';
      
      // Find relevant documents based on query terms
      const relevantDocs = this.documents.filter(doc => {
        const lowerContent = doc.content.toLowerCase();
        const lowerTitle = doc.metadata.title.toLowerCase();
        const lowerCategory = doc.metadata.category ? doc.metadata.category.toLowerCase() : '';
        
        // Check if document content or metadata matches query or conversation context
        return (
          lowerContent.includes(lowerQuery) || 
          lowerTitle.includes(lowerQuery) || 
          lowerCategory.includes(lowerQuery) ||
          (conversationContext && lowerContent.includes(lowerContext))
        );
      });
      
      // If no relevant documents found, return empty string
      if (relevantDocs.length === 0) {
        return '';
      }
      
      // Format the relevant documents into a context string
      const formattedContext = relevantDocs.map(doc => {
        return `--- ${doc.metadata.title} ---\n${doc.content}\n`;
      }).join('\n');
      
      return formattedContext;
    } catch (error) {
      console.error('Error retrieving RAG context:', error);
      // In case of error, return empty string to continue without context
      return '';
    }
  }

  /**
   * Get all documents (for admin purposes)
   */
  async getAllDocuments(userId: string, organizationId: string, limit: number = 10, offset: number = 0): Promise<Document[]> {
    try {
      // In a real implementation, this would filter by organization and apply pagination
      return this.documents.slice(offset, offset + limit);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting RAG documents: ${errorMessage}`);
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string, userId: string, organizationId: string): Promise<Document | null> {
    try {
      const document = this.documents.find(doc => doc.id === id);
      return document || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(500, `Error getting document by ID: ${errorMessage}`);
    }
  }
}
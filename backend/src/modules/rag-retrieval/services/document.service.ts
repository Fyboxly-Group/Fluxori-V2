import { Storage } from '@google-cloud/storage';
import { DocumentChunk, DocumentMetadata, IDocumentService } from '../interfaces/vector-search.interface';
import { injectable } from 'inversify';
import 'reflect-metadata';

/**
 * Service for retrieving and managing document chunks in the knowledge base
 */
@injectable()
export class DocumentService implements IDocumentService {
  private storage: Storage;
  private bucketName: string;
  private documentCacheMap: Map<string, DocumentChunk>;
  private cacheExpiryMs: number;
  
  /**
   * Creates an instance of DocumentService.
   */
  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.GCP_KB_STORAGE_BUCKET || '';
    
    // Simple in-memory cache for document chunks
    this.documentCacheMap = new Map<string, DocumentChunk>();
    this.cacheExpiryMs = 60 * 60 * 1000; // 1 hour cache expiry
    
    if (!this.bucketName) {
      console.error('GCP_KB_STORAGE_BUCKET environment variable is required');
    }
  }
  
  /**
   * Get document chunks by IDs
   * @param ids Array of document chunk IDs
   * @returns Array of document chunks
   */
  public async getDocumentChunks(ids: string[]): Promise<DocumentChunk[]> {
    try {
      // Filter out any empty IDs
      const validIds = ids.filter(id => id && id.trim() !== '');
      
      if (validIds.length === 0) {
        return [];
      }
      
      // Try to get documents from cache first
      const cachedDocs: DocumentChunk[] = [];
      const missingIds: string[] = [];
      
      for (const id of validIds) {
        const cachedDoc = this.getCachedDocument(id);
        if (cachedDoc) {
          cachedDocs.push(cachedDoc);
        } else {
          missingIds.push(id);
        }
      }
      
      // If all documents were in cache, return them
      if (missingIds.length === 0) {
        return cachedDocs;
      }
      
      // Otherwise, fetch the missing documents
      const fetchedDocs = await this.fetchDocumentsFromStorage(missingIds);
      
      // Cache the fetched documents
      for (const doc of fetchedDocs) {
        this.cacheDocument(doc);
      }
      
      // Combine cached and fetched documents
      return [...cachedDocs, ...fetchedDocs];
    } catch (error) {
      console.error('Error getting document chunks:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to get document chunks: ${String(error)}`);
      }
    }
  }
  
  /**
   * Get a document chunk by ID
   * @param id Document chunk ID
   * @returns Document chunk or null if not found
   */
  public async getDocumentChunk(id: string): Promise<DocumentChunk | null> {
    try {
      if (!id || id.trim() === '') {
        return null;
      }
      
      // Check cache first
      const cachedDoc = this.getCachedDocument(id);
      if (cachedDoc) {
        return cachedDoc;
      }
      
      // Fetch from storage if not in cache
      const docs = await this.fetchDocumentsFromStorage([id]);
      if (docs.length === 0) {
        return null;
      }
      
      // Cache the document
      const doc = docs[0];
      this.cacheDocument(doc);
      
      return doc;
    } catch (error) {
      console.error(`Error getting document chunk ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get a cached document if available and not expired
   * @param id Document ID
   * @returns Document chunk or undefined if not in cache
   */
  private getCachedDocument(id: string): DocumentChunk | undefined {
    const cachedEntry = this.documentCacheMap.get(id);
    
    if (!cachedEntry) {
      return undefined;
    }
    
    // Check if the cache entry has a timestamp and is still valid
    const timestamp = cachedEntry.metadata.cacheTimestamp as number;
    if (timestamp && Date.now() - timestamp > this.cacheExpiryMs) {
      // Cache entry expired, remove it
      this.documentCacheMap.delete(id);
      return undefined;
    }
    
    return cachedEntry;
  }
  
  /**
   * Cache a document chunk
   * @param doc Document chunk to cache
   */
  private cacheDocument(doc: DocumentChunk): void {
    // Add cache timestamp to metadata
    const docWithTimestamp = {
      ...doc,
      metadata: {
        ...doc.metadata,
        cacheTimestamp: Date.now()
      }
    };
    
    this.documentCacheMap.set(doc.id, docWithTimestamp);
  }
  
  /**
   * Fetch documents from GCS storage
   * @param ids Document IDs to fetch
   * @returns Array of document chunks
   */
  private async fetchDocumentsFromStorage(ids: string[]): Promise<DocumentChunk[]> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const results: DocumentChunk[] = [];
      
      // Process each ID in parallel
      const fetchPromises = ids.map(async (id) => {
        try {
          // Determine file path from ID (adjust this based on your storage structure)
          // Example: docs/123.json or chunks/abc-xyz.json
          const filePath = this.getFilePathFromId(id);
          const file = bucket.file(filePath);
          
          // Check if file exists
          const [exists] = await file.exists();
          if (!exists) {
            console.warn(`Document file not found for ID: ${id}`);
            return null;
          }
          
          // Download and parse the file
          const [content] = await file.download();
          const contentStr = content.toString('utf-8');
          const docData = JSON.parse(contentStr);
          
          // Create document chunk object
          const doc: DocumentChunk = {
            id,
            text: docData.text || '',
            metadata: this.parseMetadata(docData.metadata || {})
          };
          
          return doc;
        } catch (error) {
          console.error(`Error fetching document ${id}:`, error);
          return null;
        }
      });
      
      // Wait for all fetches to complete
      const fetchedDocs = await Promise.all(fetchPromises);
      
      // Filter out nulls (failed fetches)
      for (const doc of fetchedDocs) {
        if (doc) {
          results.push(doc);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching documents from storage:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to fetch documents: ${String(error)}`);
      }
    }
  }
  
  /**
   * Convert document ID to storage file path
   * @param id Document ID
   * @returns File path in storage
   */
  private getFilePathFromId(id: string): string {
    // This may need to be customized based on your storage structure
    // Example: If IDs look like "doc123" and files are stored as "docs/123.json"
    // or if IDs have section prefixes like "faq-123" mapped to "faq/123.json"
    
    // Simple mapping for default structure with all documents in one folder
    return `chunks/${id}.json`;
  }
  
  /**
   * Parse metadata from raw object
   * @param raw Raw metadata object
   * @returns Parsed document metadata
   */
  private parseMetadata(raw: any): DocumentMetadata {
    try {
      return {
        source: raw.source || 'unknown',
        title: raw.title,
        url: raw.url,
        created: raw.created ? new Date(raw.created) : undefined,
        updated: raw.updated ? new Date(raw.updated) : undefined,
        author: raw.author,
        category: raw.category,
        tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? [raw.tags] : []),
        // Pass through any other fields
        ...raw
      };
    } catch (error) {
      console.warn('Error parsing metadata:', error);
      return { source: 'unknown' };
    }
  }
}
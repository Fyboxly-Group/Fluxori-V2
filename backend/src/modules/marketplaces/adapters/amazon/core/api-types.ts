/**
 * Request options for Amazon API calls
 */
export interface RequestOptions {
  /**
   * Amazon marketplace ID
   */
  marketplaceId: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to retry on failure
   */
  retry?: boolean;
}

/**
 * Common paginated response structure for Amazon APIs
 */
export interface PaginatedResponse<T = any> {
  /**
   * The list of items returned
   */
  items: T[];
  
  /**
   * Token for the next page of results
   */
  nextToken?: string;
  
  /**
   * Current page number
   */
  pageNumber: number;
  
  /**
   * Size of each page
   */
  pageSize: string;
  
  /**
   * Total number of pages
   */
  totalPages?: string;
  
  /**
   * Total number of items across all pages
   */
  totalItems?: string;
  
  /**
   * Whether there are more items to fetch
   */
  hasMore: boolean;
  
  /**
   * Query used to fetch these results
   */
  query?: string;
}

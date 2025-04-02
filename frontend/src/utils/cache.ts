/**
 * Advanced caching utility for data and API responses
 * with support for TTL, capacity limits, and persistence
 */

// Cache item interface
interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp when the item expires, null for never
  lastAccess: number;    // Timestamp of last access for LRU
}

// Cache options interface
interface CacheOptions {
  /** Cache capacity (max items), defaults to 100 */
  capacity?: number;
  /** Default TTL in milliseconds, defaults to 5 minutes */
  defaultTTL?: number;
  /** Storage type, defaults to memory */
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  /** Cache name for persistent storage */
  name?: string;
  /** Enable debugging */
  debug?: boolean;
}

/**
 * Advanced cache implementation with TTL, LRU, and persistence options
 */
export class AdvancedCache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private capacity: number;
  private defaultTTL: number;
  private storage: 'memory' | 'localStorage' | 'sessionStorage';
  private name: string;
  private debug: boolean;

  constructor(options: CacheOptions = {}) {
    const {
      capacity = 100,
      defaultTTL = 5 * 60 * 1000, // 5 minutes
      storage = 'memory',
      name = 'app-cache',
      debug = false,
    } = options;

    this.capacity = capacity;
    this.defaultTTL = defaultTTL;
    this.storage = storage;
    this.name = name;
    this.debug = debug;

    // Initialize from persistent storage if applicable
    this.loadFromStorage();
  }

  /**
   * Get an item from the cache
   */
  get(key: string): T | undefined {
    // Clean expired items first
    this.cleanExpired();

    const item = this.cache.get(key);
    if (!item) {
      this.log(`Cache miss: ${key}`);
      return undefined;
    }

    // Check if expired
    if (item.expiry !== null && item.expiry < Date.now()) {
      this.log(`Cache expired: ${key}`);
      this.cache.delete(key);
      this.saveToStorage();
      return undefined;
    }

    // Update last access time for LRU
    item.lastAccess = Date.now();
    this.log(`Cache hit: ${key}`);
    
    return item.value;
  }

  /**
   * Set an item in the cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // Clean expired items first
    this.cleanExpired();

    // Check capacity and evict if needed
    if (this.cache.size >= this.capacity && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiry = ttl !== undefined
      ? (ttl === 0 ? null : Date.now() + ttl)
      : (this.defaultTTL === 0 ? null : Date.now() + this.defaultTTL);

    this.cache.set(key, {
      value,
      expiry,
      lastAccess: Date.now(),
    });

    this.log(`Cache set: ${key}, expiry: ${expiry}`);
    this.saveToStorage();
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.log(`Cache delete: ${key}`);
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Check if an item exists in the cache and is not expired
   */
  has(key: string): boolean {
    // Clean expired items first
    this.cleanExpired();

    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (item.expiry !== null && item.expiry < Date.now()) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }

    return true;
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
    this.log('Cache cleared');
    this.saveToStorage();
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    // Clean expired items first
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size (number of items)
   */
  size(): number {
    // Clean expired items first
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Remove expired items from the cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    let expired = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry !== null && item.expiry < now) {
        this.cache.delete(key);
        expired++;
      }
    }

    if (expired > 0) {
      this.log(`Cleaned ${expired} expired items`);
      this.saveToStorage();
    }
  }

  /**
   * Evict the least recently used item from the cache
   */
  private evictLRU(): void {
    let oldest: { key: string; lastAccess: number } | null = null;

    for (const [key, item] of this.cache.entries()) {
      if (!oldest || item.lastAccess < oldest.lastAccess) {
        oldest = { key, lastAccess: item.lastAccess };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
      this.log(`LRU eviction: ${oldest.key}`);
    }
  }

  /**
   * Save cache to persistent storage if applicable
   */
  private saveToStorage(): void {
    if (this.storage === 'memory' || typeof window === 'undefined') {
      return;
    }

    try {
      const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
      
      // Convert cache to serializable format
      const serialized = Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        value: item.value,
        expiry: item.expiry,
        lastAccess: item.lastAccess,
      }));
      
      storage.setItem(`${this.name}`, JSON.stringify(serialized));
      this.log('Cache saved to storage');
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  /**
   * Load cache from persistent storage if applicable
   */
  private loadFromStorage(): void {
    if (this.storage === 'memory' || typeof window === 'undefined') {
      return;
    }

    try {
      const storage = this.storage === 'localStorage' ? localStorage : sessionStorage;
      const data = storage.getItem(`${this.name}`);
      
      if (data) {
        const parsed = JSON.parse(data) as Array<{
          key: string;
          value: T;
          expiry: number | null;
          lastAccess: number;
        }>;
        
        // Restore cache from parsed data
        this.cache = new Map(
          parsed.map(({ key, value, expiry, lastAccess }) => [
            key,
            { value, expiry, lastAccess }
          ])
        );
        
        this.log(`Loaded ${this.cache.size} items from storage`);
        
        // Clean expired items
        this.cleanExpired();
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.debug && typeof console !== 'undefined') {
      console.log(`[Cache] ${message}`);
    }
  }
}

// Create default cache instances
export const memoryCache = new AdvancedCache({ storage: 'memory' });
export const persistentCache = new AdvancedCache({ 
  storage: 'localStorage',
  name: 'fluxori-cache',
  capacity: 200,
  defaultTTL: 24 * 60 * 60 * 1000 // 24 hours
});
export const sessionCache = new AdvancedCache({
  storage: 'sessionStorage',
  name: 'fluxori-session-cache',
  capacity: 50,
  defaultTTL: 30 * 60 * 1000 // 30 minutes
});

/**
 * Hook for using the cache in components
 */
export function useCache<T = any>(key: string, fetcher: () => Promise<T>, options: {
  ttl?: number;
  cache?: AdvancedCache<T>;
  dependencies?: any[];
} = {}) {
  const {
    ttl,
    cache = memoryCache as AdvancedCache<T>,
    dependencies = [],
  } = options;
  
  const [data, setData] = React.useState<T | undefined>(cache.get(key));
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    let isMounted = true;
    
    if (!cache.has(key)) {
      setLoading(true);
      
      fetcher()
        .then((result) => {
          if (isMounted) {
            cache.set(key, result, ttl);
            setData(result);
            setLoading(false);
            setError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err);
            setLoading(false);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ttl, ...dependencies]);
  
  // Function to force refresh
  const refresh = React.useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await fetcher();
      cache.set(key, result, ttl);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, ttl, fetcher, cache]);
  
  return { data, loading, error, refresh };
}

export default {
  AdvancedCache,
  memoryCache,
  persistentCache,
  sessionCache,
  useCache
};
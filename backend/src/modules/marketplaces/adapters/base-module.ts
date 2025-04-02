/**
 * Base interface for all marketplace adapter modules
 */
export interface BaseModule {
  /**
   * Unique identifier for the module
   */
  id: string;
  
  /**
   * Human-readable name of the module
   */
  name: string;
  
  /**
   * Module version
   */
  version: string;
}

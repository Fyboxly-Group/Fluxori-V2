/**
 * Amazon Product Type Definitions API Module
 * 
 * Implements the Amazon SP-API Product Type Definitions API functionality.
 * This module handles product type definitions, attribute requirements, and validation.
 */

import { BaseApiModule, ApiRequestOptions, ApiResponse } from '../core/api-module';
import { AmazonErrorUtil, AmazonErrorCode } from '../utils/amazon-error';

/**
 * Product type definition
 */
export interface ProductTypeDefinition {
  /**
   * Name of the product type
   */
  name: string;
  
  /**
   * Display name of the product type
   */
  displayName?: string;
  
  /**
   * Description of the product type
   */
  description?: string;
  
  /**
   * Marketplace IDs where this product type is available
   */
  marketplaceIds?: string[];
}

/**
 * Product type property group
 */
export interface PropertyGroup {
  /**
   * Title of the property group
   */
  title?: string;
  
  /**
   * Description of the property group
   */
  description?: string;
  
  /**
   * Names of properties in this group
   */
  propertyNames?: string[];
}

/**
 * Schema attribute
 */
export interface SchemaAttribute {
  /**
   * Whether the attribute is required
   */
  required?: boolean;
  
  /**
   * Type of the attribute
   */
  type?: string[];
  
  /**
   * Pattern for the attribute value
   */
  pattern?: string;
  
  /**
   * Whether the attribute is read-only
   */
  readOnly?: boolean;
  
  /**
   * Whether the attribute is restricted
   */
  restricted?: boolean;
  
  /**
   * Default value for the attribute
   */
  default?: any;
  
  /**
   * Example value for the attribute
   */
  example?: any;
  
  /**
   * Units allowed for the attribute
   */
  allowedUnits?: string[];
  
  /**
   * Values allowed for the attribute
   */
  enum?: any[];
  
  /**
   * Minimum value for the attribute
   */
  minimum?: number;
  
  /**
   * Maximum value for the attribute
   */
  maximum?: number;
  
  /**
   * Minimum length for the attribute
   */
  minLength?: number;
  
  /**
   * Maximum length for the attribute
   */
  maxLength?: number;
  
  /**
   * Minimum items for array attributes
   */
  minItems?: number;
  
  /**
   * Maximum items for array attributes
   */
  maxItems?: number;
  
  /**
   * Items definition for array attributes
   */
  items?: SchemaAttribute;
  
  /**
   * Properties for object attributes
   */
  properties?: Record<string, SchemaAttribute>;
}

/**
 * Product type schema
 */
export interface ProductTypeSchema {
  /**
   * Schema properties
   */
  properties?: Record<string, SchemaAttribute>;
  
  /**
   * Required properties
   */
  required?: string[];
  
  /**
   * Property groups
   */
  propertyGroups?: Record<string, PropertyGroup>;
  
  /**
   * Definition version
   */
  definitionVersion?: string;
  
  /**
   * Definition label
   */
  definitionLabel?: string;
}

/**
 * Product type search parameters
 */
export interface SearchProductTypesParams {
  /**
   * Keywords to search for
   */
  keywords?: string[];
  
  /**
   * Marketplace ID to search in
   */
  marketplaceId?: string;
  
  /**
   * Page token for pagination
   */
  pageToken?: string;
}

/**
 * Get product type definition parameters
 */
export interface GetProductTypeParams {
  /**
   * Product type to get
   */
  productType: string;
  
  /**
   * Marketplace ID
   */
  marketplaceId?: string;
  
  /**
   * Product type version
   */
  productTypeVersion?: string;
  
  /**
   * Requirements enforcement level
   */
  requirementsEnforced?: 'ENFORCED' | 'NOT_ENFORCED';
  
  /**
   * Locale for localized strings
   */
  locale?: string;
  
  /**
   * Property groups to include
   */
  propertyGroups?: string[];
}

/**
 * Implementation of the Amazon Product Type Definitions API
 */
export class ProductTypeDefinitionsModule extends BaseApiModule {
  /**
   * Constructor
   * @param apiVersion API version
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string, 
    makeApiRequest: <T>(
      method: string, 
      endpoint: string, 
      options?: any
    ) => Promise<{ data: T; status: number; headers: Record<string, string> }>,
    marketplaceId: string
  ) {
    super('productTypeDefinitions', apiVersion, makeApiRequest, marketplaceId);
  }
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  protected async initializeModule(config?: any): Promise<void> {
    // No specific initialization required for this module
    return Promise.resolve();
  }
  
  /**
   * Search for product types
   * @param params Search parameters
   * @returns List of product types
   */
  public async searchProductTypes(params: SearchProductTypesParams = {}): Promise<ApiResponse<{
    productTypes: ProductTypeDefinition[];
    pageToken?: string;
  }>> {
    const queryParams: Record<string, any> = {};
    
    // Add keywords if provided
    if (params.keywords && params.keywords.length > 0) {
      queryParams.keywords = params.keywords.join(',');
    }
    
    // Add marketplace ID (required)
    queryParams.marketplaceIds = params.marketplaceId || this.marketplaceId;
    
    // Add page token if provided
    if (params.pageToken) {
      queryParams.pageToken = params.pageToken;
    }
    
    try {
      return await this.makeRequest<{
        productTypes: ProductTypeDefinition[];
        pageToken?: string;
      }>({
        method: 'GET',
        path: '/productTypes',
        params: queryParams
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.searchProductTypes`);
    }
  }
  /**
   * Get all product types (handles pagination)
   * @param keywords Keywords to search for
   * @param marketplaceId Marketplace ID
   * @param maxPages Maximum number of pages to retrieve (default: 10)
   * @returns All product types
   */
  public async getAllProductTypes(
    keywords?: string[],
    marketplaceId?: string,
    maxPages: number = 10
  ): Promise<ProductTypeDefinition[]> {
    let currentPage = 1;
    let nextToken: string | undefined = undefined;
    const allProductTypes: ProductTypeDefinition[] = [];
    
    do {
      // Get a page of product types
      const response = await this.searchProductTypes({
        keywords: keywords,
        marketplaceId: marketplaceId || this.marketplaceId,
        pageToken: nextToken
      });
      
      // Add product types to our collection
      if (response.data.productTypes && response.data.productTypes.length > 0) {
        allProductTypes.push(...response.data.productTypes);
      }
      
      // Get next token for pagination
      nextToken = response.data.pageToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while (nextToken && currentPage <= maxPages);
    
    return allProductTypes;
  }
  
  /**
   * Get product type definition
   * @param params Product type parameters
   * @returns Product type schema
   */
  public async getProductType(params: GetProductTypeParams): Promise<ApiResponse<ProductTypeSchema>> {
    if (!params.productType) {
      throw AmazonErrorUtil.createError('Product type is required', AmazonErrorCode.INVALID_INPUT);
    }
    
    const queryParams: Record<string, any> = {};
    
    // Add marketplace ID (required)
    queryParams.marketplaceIds = params.marketplaceId || this.marketplaceId;
    
    // Add optional parameters if provided
    if (params.productTypeVersion) {
      queryParams.productTypeVersion = params.productTypeVersion;
    }
    
    if (params.requirementsEnforced) {
      queryParams.requirementsEnforced = params.requirementsEnforced;
    }
    
    if (params.locale) {
      queryParams.locale = params.locale;
    }
    
    if (params.propertyGroups && params.propertyGroups.length > 0) {
      queryParams.propertyGroups = params.propertyGroups.join(',');
    }
    
    try {
      return await this.makeRequest<ProductTypeSchema>({
        method: 'GET',
        path: `/productTypes/${encodeURIComponent(params.productType)}`,
        params: queryParams
      });
    } catch (error) {
      throw AmazonErrorUtil.mapHttpError(error, `${this.moduleName}.getProductType`);
    }
  }
  /**
   * Get required attributes for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Object containing required attribute names
   */
  public async getRequiredAttributes(productType: string, marketplaceId?: string): Promise<string[]> {
    try {
      // Get the product type schema
      const response = await this.getProductType({
        productType: productType,
        marketplaceId: marketplaceId || this.marketplaceId,
        requirementsEnforced: 'ENFORCED'
      });
      
      // Return the required attributes
      return response.data.required || [];
    } catch (error) {
      console.error(`Failed to get required attributes for ${productType}:`, error);
      return [];
    }
  }
  /**
   * Get all attributes for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Object containing all attributes with their definitions
   */
  public async getAllAttributes(productType: string, marketplaceId?: string): Promise<Record<string, SchemaAttribute>> {
    try {
      // Get the product type schema
      const response = await this.getProductType({
        productType: productType,
        marketplaceId: marketplaceId || this.marketplaceId
      });
      
      // Return all properties (attributes)
      return response.data.properties || {};
    } catch (error) {
      console.error(`Failed to get attributes for ${productType}:`, error);
      return {};
    }
  }
  /**
   * Validate product attributes against a product type schema
   * @param productType Product type name
   * @param attributes Product attributes to validate
   * @param marketplaceId Marketplace ID
   * @returns Validation result with any errors
   */
  public async validateAttributes(
    productType: string,
    attributes: Record<string, any>,
    marketplaceId?: string
  ): Promise<{
    valid: boolean;
    errors: Array<{
      path: string;
      message: string;
      attributeName: string;
    }>;
  }> {
    try {
      // Get the product type schema
      const schema = await this.getProductType({
        productType: productType,
        marketplaceId: marketplaceId || this.marketplaceId,
        requirementsEnforced: 'ENFORCED'
      });
      
      const errors: Array<{
        path: string;
        message: string;
        attributeName: string;
      }> = [];
      
      // Check for required attributes
      if (schema.data.required) {
        for (const requiredAttr of schema.data.required) {
          if (attributes[requiredAttr] === undefined) {
            errors.push({
              path: requiredAttr,
              message: `Required attribute '${requiredAttr}' is missing`,
              attributeName: requiredAttr
            });
          }
        }
      }
      // Validate against schema properties
      if (schema.data.properties) {
        for (const [attrName, attr] of Object.entries(attributes)) {
          const schemaAttr = schema.data.properties[attrName];
          
          if (!schemaAttr) {
            // Attribute not in schema
            errors.push({
              path: attrName,
              message: `Attribute '${attrName}' is not defined in the schema`,
              attributeName: attrName
            });
            continue;
          }
          
          // Validate type
          if (schemaAttr.type && attr !== null && attr !== undefined) {
            const type = Array.isArray(schemaAttr.type) ? schemaAttr.type : [schemaAttr.type];
            const attrType = Array.isArray(attr) ? 'array' : typeof attr;
            
            if (!type.includes(attrType)) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should be of type ${type.join(' or ')}, but got ${attrType}`,
                attributeName: attrName
              });
            }
          }
          // Validate enum
          if (schemaAttr.enum && attr !== null && attr !== undefined) {
            if (!schemaAttr.enum.includes(attr)) {
              errors.push({
                path: attrName,
                message: `Value '${attr}' for attribute '${attrName}' is not in the allowed values: ${schemaAttr.enum.join(', ')}`,
                attributeName: attrName
              });
            }
          }
          
          // Validate string length
          if (typeof attr === 'string') {
            if (schemaAttr.minLength !== undefined && attr.length < schemaAttr.minLength) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should have a minimum length of ${schemaAttr.minLength}`,
                attributeName: attrName
              });
            }
            
            if (schemaAttr.maxLength !== undefined && attr.length > schemaAttr.maxLength) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should have a maximum length of ${schemaAttr.maxLength}`,
                attributeName: attrName
              });
            }
            
            if (schemaAttr.pattern && !new RegExp(schemaAttr.pattern).test(attr)) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' does not match the required pattern`,
                attributeName: attrName
              });
            }
          }
          // Validate number range
          if (typeof attr === 'number') {
            if (schemaAttr.minimum !== undefined && attr < schemaAttr.minimum) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should be at least ${schemaAttr.minimum}`,
                attributeName: attrName
              });
            }
            
            if (schemaAttr.maximum !== undefined && attr > schemaAttr.maximum) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should be at most ${schemaAttr.maximum}`,
                attributeName: attrName
              });
            }
          }
          // Validate array
          if (Array.isArray(attr)) {
            if (schemaAttr.minItems !== undefined && attr.length < schemaAttr.minItems) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should have at least ${schemaAttr.minItems} items`,
                attributeName: attrName
              });
            }
            
            if (schemaAttr.maxItems !== undefined && attr.length > schemaAttr.maxItems) {
              errors.push({
                path: attrName,
                message: `Attribute '${attrName}' should have at most ${schemaAttr.maxItems} items`,
                attributeName: attrName
              });
            }
          }
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error(`Failed to validate attributes for ${productType}:`, error);
      return {
        valid: false,
        errors: [{
          path: 'root',
          message: `Failed to validate: ${error instanceof Error ? error.message : String(error) || 'Unknown error'}`,
          attributeName: 'root'
        }]
      };
    }
  }
  /**
   * Get property groups for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Property groups
   */
  public async getPropertyGroups(productType: string, marketplaceId?: string): Promise<Record<string, PropertyGroup>> {
    try {
      // Get the product type schema
      const response = await this.getProductType({
        productType: productType,
        marketplaceId: marketplaceId || this.marketplaceId,
        propertyGroups: ['PRODUCT_DETAILS', 'LISTING', 'OFFER', 'COMPLIANCE']
      });
      
      // Return the property groups
      return response.data.propertyGroups || {};
    } catch (error) {
      console.error(`Failed to get property groups for ${productType}:`, error);
      return {};
    }
  }
  /**
   * Build a product creation template for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Product template with required attributes
   */
  public async buildProductTemplate(productType: string, marketplaceId?: string): Promise<{
    productType: string;
    requiredAttributes: string[];
    attributeDefinitions: Record<string, SchemaAttribute>;
    template: Record<string, any>;
  }> {
    try {
      // Get the product type schema
      const schema = await this.getProductType({
        productType: productType,
        marketplaceId: marketplaceId || this.marketplaceId,
        requirementsEnforced: 'ENFORCED'
      });
      
      const requiredAttributes = schema.data.required || [];
      const attributeDefinitions = schema.data.properties || {};
      
      // Create a template with default values for required attributes
      const template: Record<string, any> = {};
      
      for (const attr of requiredAttributes) {
        const definition = attributeDefinitions[attr];
        
        if (definition) {
          // Use default value if available
          if (definition.default !== undefined) {
            template[attr] = definition.default;
          }
          // Use example if available
          else if (definition.example !== undefined) {
            template[attr] = definition.example;
          }
          // Use first enum value if available
          else if (definition.enum && definition.enum.length > 0) {
            template[attr] = definition.enum[0];
          }
          // Use empty string for string attributes
          else if (definition.type?.includes('string')) {
            template[attr] = '';
          }
          // Use 0 for number attributes
          else if (definition.type?.includes('number') || definition.type?.includes('integer')) {
            template[attr] = 0;
          }
          // Use empty array for array attributes
          else if (definition.type?.includes('array')) {
            template[attr] = [];
          }
          // Use empty object for object attributes
          else if (definition.type?.includes('object')) {
            template[attr] = {};
          }
          // Use null for unknown types
          else {
            template[attr] = null;
          }
        }
      }
      
      return {
        productType,
        requiredAttributes,
        attributeDefinitions,
        template
      };
    } catch (error) {
      console.error(`Failed to build product template for ${productType}:`, error);
      throw AmazonErrorUtil.createError(
        `Failed to build product template: ${error instanceof Error ? error.message : String(error) || 'Unknown error'}`,
        AmazonErrorCode.SERVICE_UNAVAILABLE,
        error
      );
    }
  }
}
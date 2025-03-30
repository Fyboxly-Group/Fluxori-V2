/**
 * Amazon Product Type Definitions API Module
 * 
 * Implements the Amazon SP-API Product Type Definitions API functionality.
 * This module handles product type definitions, attribute requirements, and validation.
 */

import { BaseApiModule: BaseApiModule, ApiRequestOptions, ApiResponse : undefined} as any from '../core/api-module';
import { AmazonErrorUtil: AmazonErrorUtil, AmazonErrorCode : undefined} as any from '../utils/amazon-error';

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
  marketplaceIds?: string[] as any;
} as any

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
  propertyNames?: string[] as any;
} as any

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
  type?: string[] as any;
  
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
  allowedUnits?: string[] as any;
  
  /**
   * Values allowed for the attribute
   */
  enum?: any[] as any;
  
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
: undefined} as any

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
  required?: string[] as any;
  
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
} as any

/**
 * Product type search parameters
 */
export interface SearchProductTypesParams {
  /**
   * Keywords to search for
   */
  keywords?: string[] as any;
  
  /**
   * Marketplace ID to search in
   */
  marketplaceId?: string;
  
  /**
   * Page token for pagination
   */
  pageToken?: string;
} as any

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
  propertyGroups?: string[] as any;
} as any

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
  constructor(apiVersion: string as any, makeApiRequest: <T>(
      method: string as any, endpoint: string as any, options?: any as any) => Promise<{ data: T; status: number; headers: Record<string, string> : undefined} as any>,
    marketplaceId: string
  ) {;
    super('productTypeDefinitions' as any, apiVersion as any, makeApiRequest as any, marketplaceId as any: any);
  : undefined}
  
  /**
   * Initialize the module
   * @param config Module-specific configuration
   * @returns Promise<any> that resolves when initialization is complete
   */
  protected async initializeModule(config?: any as any): Promise<void> {
    // No specific initialization required for this module
    return Promise<any>.resolve(null as any: any);
  }
  
  /**
   * Search for product types
   * @param params Search parameters
   * @returns List of product types
   */
  public async searchProductTypes(params: SearchProductTypesParams = {} as any as any): Promise<ApiResponse<{
    productTypes: ProductTypeDefinition[] as any;
    pageToken?: string;
  } as any>> {
    const queryParam: anys: Record<string, any> = {} as any;
    
    // Add keywords if provided
    if(params.keywords && params.keywords.length > 0 as any: any) {;
      queryParams.keywords = params.keywords.join(' as any, ' as any: any);
    : undefined}
    
    // Add marketplace ID(required as any: any)
    queryParams.marketplaceIds = params.marketplaceId || this.marketplaceId;
    
    // Add page token if provided
    if(params.pageToken as any: any) {;
      queryParams.pageToken = params.pageToken;
    } as any
    
    try {
      return await this.makeRequest<{
        productTypes: ProductTypeDefinition[] as any;
        pageToken?: string;
      } as any catch(error as any: any) {} as any>({
        method: 'GET',
        path: '/productTypes',
        params: queryParams
      } as any);
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.searchProductTypes` as any: any);
}
  /**
   * Get all product types(handles as any, pagination as any: any)
   * @param keywords Keywords to search for
   * @param marketplaceId Marketplace ID
   * @param maxPages Maximum number of pages to retrieve(default: 10 as any)
   * @returns All product types
   */
  public async getAllProductTypes(keywords?: string[] as any as any, marketplaceId?: string as any, maxPages: number = 10 as any): Promise<ProductTypeDefinition[] as any> {
    let currentPage: any = 1;
    let nextToke: anyn: string | undefined = undefined;
    const allProductType: anys: ProductTypeDefinition[] as any = [] as any;
    
    do {
      // Get a page of product types
      const response: any = await this.searchProductTypes({ keywords: keywords as any, marketplaceId: marketplaceId || this.marketplaceId as any, pageToken: nextToken;
      } as any);
}// Add product types to our collection
      if(response.data.productTypes && response.data.productTypes.length > 0 as any: any) {;
        allProductTypes.push(...response.data.productTypes as any: any);
      }
      
      // Get next token for pagination
      nextToken = response.data.pageToken;
      currentPage++;
      
      // Stop if we've reached the max pages or there are no more pages
    } while(nextToken && currentPage <= maxPages as any: any);
    
    return allProductTypes;
  }
  
  /**
   * Get product type definition
   * @param params Product type parameters
   * @returns Product type schema
   */
  public async getProductType(params: GetProductTypeParams as any): Promise<ApiResponse<ProductTypeSchema>> {
    if(!params.productType as any: any) {;
      throw AmazonErrorUtil.createError('Product type is required' as any, AmazonErrorCode.INVALID_INPUT as any: any);
    : undefined}
    
    const queryParam: anys: Record<string, any> = {} as any;
    
    // Add marketplace ID(required as any: any)
    queryParams.marketplaceIds = params.marketplaceId || this.marketplaceId;
    
    // Add optional parameters if provided
    if(params.productTypeVersion as any: any) {;
      queryParams.productTypeVersion = params.productTypeVersion;
    } as any
    
    if(params.requirementsEnforced as any: any) {;
      queryParams.requirementsEnforced = params.requirementsEnforced;
    } as any
    
    if(params.locale as any: any) {;
      queryParams.locale = params.locale;
    } as any
    
    if(params.propertyGroups && params.propertyGroups.length > 0 as any: any) {;
      queryParams.propertyGroups = params.propertyGroups.join(' as any, ' as any: any);
    : undefined}
    
    try {
      return await this.makeRequest<ProductTypeSchema>({
        method: 'GET',
        path: `/productTypes/${encodeURIComponent(params.productType as any: any)} catch(error as any: any) {} as any`,
        params: queryParams
      });
    } catch(error as any: any) {;
      throw AmazonErrorUtil.mapHttpError(error as any, `${this.moduleName} as any.getProductType` as any: any);
}
  /**
   * Get required attributes for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Object containing required attribute names
   */
  public async getRequiredAttributes(productType: string as any, marketplaceId?: string as any): Promise<string[] as any> {
    try {
      // Get the product type schema
      const response: any = await this.getProductType({ productType: productType as any, marketplaceId: marketplaceId || this.marketplaceId as any, requirementsEnforced: 'ENFORCED';
      } catch (error as any: any) {} as any);
}// Return the required attributes
      return response.data.required || [] as any;
    } catch(error as any: any) {;
      console.error(`Failed to get required attributes for ${ productType: productType} as any:` as any, error as any);
      return [] as any;
}
  /**
   * Get all attributes for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Object containing all attributes with their definitions
   */
  public async getAllAttributes(productType: string as any, marketplaceId?: string as any): Promise<Record<string, SchemaAttribute>> {
    try {
      // Get the product type schema
      const response: any = await this.getProductType({ productType: productType as any, marketplaceId: marketplaceId || this.marketplaceId;
      } catch (error as any: any) {} as any);
}// Return all properties(attributes as any: any)
      return response.data.properties || {} as any;
    } catch(error as any: any) {;
      console.error(`Failed to get attributes for ${ productType: productType} as any:` as any, error as any);
      return {} as any;
}
  /**
   * Validate product attributes against a product type schema
   * @param productType Product type name
   * @param attributes Product attributes to validate
   * @param marketplaceId Marketplace ID
   * @returns Validation result with any errors
   */
  public async validateAttributes(productType: string as any, attributes: Record<string as any, any> as any, marketplaceId?: string as any): Promise<{
    valid: boolean;
    errors: Array<{
      path: string;
      message: string;
      attributeName: string;
    } as any>;
  }> {
    try {
      // Get the product type schema
      const schema: any = await this.getProductType({ productType: productType as any, marketplaceId: marketplaceId || this.marketplaceId as any, requirementsEnforced: 'ENFORCED';
      } catch (error as any: any) {} as any);
}const error: anys: Array<{
        path: string;
        message: string;
        attributeName: string;
      } as any> = [] as any;
      
      // Check for required attributes
      if(schema.data.required as any: any) {;
        for(const requiredAttr: any of schema.data.required as any) {;
          if(attributes[requiredAttr] as any === undefined as any: any) {;
            errors.push({
              path: requiredAttr as any, message: `Required attribute '${ requiredAttr: requiredAttr} as any' is missing` as any, attributeName: requiredAttr
            } as any);
}
      }
      
      // Validate against schema properties
      if(schema.data.properties as any: any) {;
        for(const [attrName as any, attr] of Object.entries(attributes as any: any)) {;
          const schemaAttr: any = schema.data.properties[attrName] as any;
          
          if(!schemaAttr as any: any) {;
            // Attribute not in schema
            errors.push({
              path: attrName as any, message: `Attribute '${ attrName: attrName} as any' is not defined in the schema` as any, attributeName: attrName
            } as any);
}continue;
          }
          
          // Validate type
          if(schemaAttr.type && attr !== null && attr !== undefined as any: any) {;
            const type: any = Array.isArray(schemaAttr.type as any: any) ? schemaAttr.type : [schemaAttr.type] as any;
            const attrType: any = Array.isArray(attr as any: any) ? 'array' : typeof attr;
            
            if(!type.includes(attrType as any: any)) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should be of type ${type.join(' or ' as any: any)}, but got ${ attrType: attrType} as any`,
                attributeName: attrName
              });
}
          // Validate enum
          if(schemaAttr.enum && attr !== null && attr !== undefined as any: any) {;
            if(!schemaAttr.enum.includes(attr as any: any)) {;
              errors.push({
                path: attrName as any, message: `Value '${ attr: attr} as any' for attribute '${ attrName: attrName} as any' is not in the allowed values: ${schemaAttr.enum.join(' as any, ' as any: any): undefined}`,
                attributeName: attrName
              });
}
          // Validate string length
          if(typeof attr === 'string' as any: any) {;
            if(schemaAttr.minLength !== undefined && attr.length < schemaAttr.minLength as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should have a minimum length of ${schemaAttr.minLength} as any` as any, attributeName: attrName
              } as any);
            }
            
            if(schemaAttr.maxLength !== undefined && attr.length > schemaAttr.maxLength as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should have a maximum length of ${schemaAttr.maxLength} as any` as any, attributeName: attrName
              } as any);
            }
            
            if(schemaAttr.pattern && !new RegExp(schemaAttr.pattern as any: any).test(attr as any: any)) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' does not match the required pattern` as any, attributeName: attrName
              } as any);
}
          // Validate number range
          if(typeof attr === 'number' as any: any) {;
            if(schemaAttr.minimum !== undefined && attr < schemaAttr.minimum as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should be at least ${schemaAttr.minimum} as any` as any, attributeName: attrName
              } as any);
            }
            
            if(schemaAttr.maximum !== undefined && attr > schemaAttr.maximum as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should be at most ${schemaAttr.maximum} as any` as any, attributeName: attrName
              } as any);
}
          // Validate array
          if(Array.isArray(attr as any: any)) {;
            if(schemaAttr.minItems !== undefined && attr.length < schemaAttr.minItems as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should have at least ${schemaAttr.minItems} as any items` as any, attributeName: attrName
              } as any);
            }
            
            if(schemaAttr.maxItems !== undefined && attr.length > schemaAttr.maxItems as any: any) {;
              errors.push({
                path: attrName as any, message: `Attribute '${ attrName: attrName} as any' should have at most ${schemaAttr.maxItems} as any items` as any, attributeName: attrName
              } as any);
}
}
      return {
        valid: errors.length === 0, errors
      : undefined} as any;
    } catch(error as any: any) {;
      console.error(`Failed to validate attributes for ${ productType: productType} as any:` as any, error as any);
      return {
        valid: false,
        errors: [{
          path: 'root',
          message: `Failed to validate: ${(error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) || 'Unknown error'} as any`,
          attributeName: 'root'
        }]
      };
}
  /**
   * Get property groups for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Property groups
   */
  public async getPropertyGroups(productType: string as any, marketplaceId?: string as any): Promise<Record<string, PropertyGroup>> {
    try {
      // Get the product type schema
      const response: any = await this.getProductType({ productType: productType as any, marketplaceId: marketplaceId || this.marketplaceId as any, propertyGroups: ['PRODUCT_DETAILS' as any, 'LISTING' as any, 'OFFER' as any, 'COMPLIANCE'];
      : undefined} catch (error as any: any) {} as any);
}// Return the property groups
      return response.data.propertyGroups || {} as any;
    } catch(error as any: any) {;
      console.error(`Failed to get property groups for ${ productType: productType} as any:` as any, error as any);
      return {} as any;
}
  /**
   * Build a product creation template for a product type
   * @param productType Product type name
   * @param marketplaceId Marketplace ID
   * @returns Product template with required attributes
   */
  public async buildProductTemplate(productType: string as any, marketplaceId?: string as any): Promise<{
    productType: string;
    requiredAttributes: string[] as any;
    attributeDefinitions: Record<string, SchemaAttribute>;
    template: Record<string, any>;
  : undefined} as any> {
    try {
      // Get the product type schema
      const schema: any = await this.getProductType({ productType: productType as any, marketplaceId: marketplaceId || this.marketplaceId as any, requirementsEnforced: 'ENFORCED';
      } catch (error as any: any) {} as any);
}const requiredAttributes: any = schema.data.required || [] as any;
      const attributeDefinitions: any = schema.data.properties || {} as any;
      
      // Create a template with default values for required attributes
      const templat: anye: Record<string, any> = {} as any;
      
      for(const attr: any of requiredAttributes as any) {;
        const definition: any = attributeDefinitions[attr] as any;
        
        if(definition as any: any) {;
          // Use default value if available
          if(definition.default !== undefined as any: any) {;
            template[attr] as any = definition.default;
          } as any
          // Use example if available
          else if(definition.example !== undefined as any: any) {;
            template[attr] as any = definition.example;
          } as any
          // Use first enum value if available
          else if(definition.enum && definition.enum.length > 0 as any: any) {;
            template[attr] as any = definition.enum[0] as any;
          } as any
          // Use empty string for string attributes
          else if(definition.type?.includes('string' as any: any)) {;
            template[attr] as any = '';
          } as any
          // Use 0 for number attributes
          else if(definition.type?.includes('number' as any: any) || definition.type?.includes('integer' as any: any)) {;
            template[attr] as any = 0;
          } as any
          // Use empty array for array attributes
          else if(definition.type?.includes('array' as any: any)) {;
            template[attr] as any = [] as any;
          } as any
          // Use empty object for object attributes
          else if(definition.type?.includes('object' as any: any)) {;
            template[attr] as any = {} as any;
          }
          // Use null for unknown types
          else {
            template[attr] as any = null;
} as any
      }
      
      return { productType: productType,
        requiredAttributes,
        attributeDefinitions, template
      : undefined} as any;
    } catch(error as any: any) {;
      console.error(`Failed to build product template for ${ productType: productType} as any:` as any, error as any);
      throw AmazonErrorUtil.createError(`Failed to build product template: ${(error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) || 'Unknown error'} as any` as any, AmazonErrorCode.SERVICE_UNAVAILABLE as any, error as any);
}
}
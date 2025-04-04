/**
 * Amazon Product Types Module
 * High-level adapter for Amazon SP-API Product Type operations
 */

import { BaseApiModule } from '../core/api-module';
import { ProductTypeDefinitionsModule } from './product-type-definitions';
import { 
  ProductTypeDefinition, 
  SchemaAttribute, 
  ProductTypeSchema,
  PropertyGroup
} from './product-type-definitions';

/**
 * Amazon Product Types Module
 * Provides high-level functionality to work with Amazon product types
 */
export class ProductTypesModule extends BaseApiModule {
  private productTypeDefinitions: ProductTypeDefinitionsModule;

  /**
   * Constructor
   * 
   * @param apiVersion API version to use
   * @param makeApiRequest Function to make API requests
   * @param marketplaceId Marketplace ID
   */
  constructor(
    apiVersion: string,
    makeApiRequest: <T>(method: string, endpoint: string, options?: any) => Promise<{
      data: T;
      status: number;
      headers: Record<string, string>;
    }>,
    marketplaceId: string,
    productTypeDefinitions?: ProductTypeDefinitionsModule
  ) {
    super('productTypes', apiVersion, makeApiRequest, marketplaceId);
    
    // Use provided product type definitions module or create a new one
    this.productTypeDefinitions = productTypeDefinitions || 
      new ProductTypeDefinitionsModule(apiVersion, makeApiRequest, marketplaceId);
  }

  /**
   * Initialize the module
   */
  protected async initializeModule(): Promise<void> {
    // No specific initialization needed
    return Promise.resolve();
  }

  /**
   * Search for product types
   * 
   * @param keywords Keywords to search for
   * @param pageToken Pagination token
   * @returns List of product types
   */
  async searchProductTypes(keywords?: string[], pageToken?: string): Promise<ProductTypeDefinition[]> {
    try {
      const response = await this.productTypeDefinitions.searchProductTypes({
        keywords,
        marketplaceId: this.marketplaceId,
        pageToken
      });
      
      return response.data.productTypes || [];
    } catch (error) {
      console.error('Error searching product types:', error);
      return [];
    }
  }

  /**
   * Get all product types
   * 
   * @param keywords Keywords to search for
   * @param maxPages Maximum number of pages to retrieve
   * @returns All product types
   */
  async getAllProductTypes(keywords?: string[], maxPages = 10): Promise<ProductTypeDefinition[]> {
    return this.productTypeDefinitions.getAllProductTypes(keywords, this.marketplaceId, maxPages);
  }

  /**
   * Get product type details
   * 
   * @param productType Product type to get
   * @param options Additional options
   * @returns Product type schema
   */
  async getProductType(
    productType: string,
    options?: {
      requirementsEnforced?: 'ENFORCED' | 'NOT_ENFORCED';
      locale?: string;
      propertyGroups?: string[];
    }
  ): Promise<ProductTypeSchema | null> {
    try {
      const response = await this.productTypeDefinitions.getProductType({
        productType,
        marketplaceId: this.marketplaceId,
        requirementsEnforced: options?.requirementsEnforced,
        locale: options?.locale,
        propertyGroups: options?.propertyGroups
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting product type ${productType}:`, error);
      return null;
    }
  }

  /**
   * Get product type template
   * 
   * @param productType Product type to get template for
   * @returns Product template
   */
  async getProductTemplate(productType: string): Promise<{
    productType: string;
    requiredAttributes: string[];
    attributeDefinitions: Record<string, SchemaAttribute>;
    template: Record<string, any>;
  } | null> {
    try {
      return await this.productTypeDefinitions.buildProductTemplate(
        productType,
        this.marketplaceId
      );
    } catch (error) {
      console.error(`Error getting product template for ${productType}:`, error);
      return null;
    }
  }

  /**
   * Validate product attributes against schema
   * 
   * @param productType Product type to validate against
   * @param attributes Attributes to validate
   * @returns Validation result
   */
  async validateProductAttributes(
    productType: string,
    attributes: Record<string, any>
  ): Promise<{
    valid: boolean;
    errors: Array<{
      path: string;
      message: string;
      attributeName: string;
    }>;
  }> {
    return this.productTypeDefinitions.validateAttributes(
      productType,
      attributes,
      this.marketplaceId
    );
  }

  /**
   * Get property groups for a product type
   * 
   * @param productType Product type to get property groups for
   * @returns Property groups
   */
  async getPropertyGroups(productType: string): Promise<Record<string, PropertyGroup>> {
    return this.productTypeDefinitions.getPropertyGroups(
      productType,
      this.marketplaceId
    );
  }

  /**
   * Get required attributes for a product type
   * 
   * @param productType Product type to get required attributes for
   * @returns Required attributes
   */
  async getRequiredAttributes(productType: string): Promise<string[]> {
    return this.productTypeDefinitions.getRequiredAttributes(
      productType,
      this.marketplaceId
    );
  }
}

export default ProductTypesModule;

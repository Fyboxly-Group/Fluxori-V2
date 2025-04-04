/**
 * Import and register all product mappers
 */
import { productMapperRegistry } from './product-mapper.interface';
import { ShopifyProductMapper } from './shopify-product.mapper';
import { AmazonProductMapper } from './amazon-product.mapper';
import { TakealotProductMapper } from './takealot-product.mapper';

// Register marketplace-specific mappers
productMapperRegistry.registerMapper('shopify', new ShopifyProductMapper());
productMapperRegistry.registerMapper('amazon', new AmazonProductMapper());
productMapperRegistry.registerMapper('amazon_us', new AmazonProductMapper());
productMapperRegistry.registerMapper('amazon_uk', new AmazonProductMapper());
productMapperRegistry.registerMapper('amazon_eu', new AmazonProductMapper());
productMapperRegistry.registerMapper('takealot', new TakealotProductMapper());

console.log('Product mappers registered');

// Export the registry and mappers
export { productMapperRegistry };
export * from './product-mapper.interface';
export * from './shopify-product.mapper';
export * from './amazon-product.mapper';
export * from './takealot-product.mapper';
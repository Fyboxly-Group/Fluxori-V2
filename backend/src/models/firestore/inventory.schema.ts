/**
 * Firestore Inventory Schema
 * 
 * Defines the schema for inventory/products in Firestore database.
 */
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Represents product dimensions and weight
 */
export interface ProductDimensions {
  weight?: number;
  weightUnit?: string; // 'kg', 'g', 'lb', 'oz'
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string; // 'cm', 'in', 'mm'
}

/**
 * Represents a product attribute
 */
export interface ProductAttribute {
  name: string;
  value: string | number | boolean | string[];
  unit?: string;
}

/**
 * Represents a marketplace-specific listing
 */
export interface MarketplaceListing {
  marketplaceProductId: string;
  status: string; // 'active', 'inactive', 'pending', etc.
  price: number;
  currencyCode: string;
  url?: string;
  lastSynced: Timestamp;
  listingErrors?: string[];
  marketplaceSpecific?: Record<string, any>; // For marketplace-specific data
}

/**
 * Represents warehouse-specific stock information
 */
export interface WarehouseStock {
  warehouseId: string;
  quantityOnHand: number;
  quantityAllocated: number;
  reorderPoint?: number;
  preferredStockLevel?: number;
  binLocation?: string;
  lastUpdated: Timestamp;
  lastStockCheck?: Timestamp;
}

/**
 * Product status enum
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived'
}

/**
 * Represents a product/inventory item in Firestore
 */
export interface FirestoreInventoryItem {
  // Organization information
  userId: string;
  orgId: string;
  
  // Product identification
  sku: string;
  barcode?: string;
  
  // Product details
  title: string;
  description?: string;
  imageUrls?: string[]; // Links to Cloud Storage
  
  // Product categorization
  categories?: string[];
  tags?: string[];
  
  // Product attributes
  attributes?: ProductAttribute[];
  dimensions?: ProductDimensions;
  
  // Pricing
  basePrice: number;
  currencyCode: string;
  costPrice?: number;
  msrp?: number; // Manufacturer's Suggested Retail Price
  salePrice?: number;
  saleStartDate?: Timestamp;
  saleEndDate?: Timestamp;
  
  // Stock information
  stockLevels: Record<string, WarehouseStock>; // Map where key is warehouseId
  totalStock?: number; // Calculated total across all warehouses
  
  // Marketplace listings
  marketplaces: Record<string, MarketplaceListing>; // Map where key is marketplaceId
  
  // Product status
  status: ProductStatus | string;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID of the creator
  supplierId?: string;
  supplierSku?: string;
  leadTime?: number; // Time in days for reordering
  minimumOrderQuantity?: number;
  isDigital?: boolean;
  isTaxable?: boolean;
  taxRate?: number;
  
  // Internal references
  internalNotes?: string;
  externalProductId?: string;
}

/**
 * Firestore document data with ID field
 */
export interface FirestoreInventoryItemWithId extends FirestoreInventoryItem {
  id: string; // Firestore document ID
}

/**
 * Converter for Firestore Inventory Item documents
 */
export const inventoryConverter = {
  toFirestore(item: FirestoreInventoryItem): FirebaseFirestore.DocumentData {
    return {
      userId: item.userId,
      orgId: item.orgId,
      sku: item.sku,
      barcode: item.barcode,
      title: item.title,
      description: item.description,
      imageUrls: item.imageUrls,
      categories: item.categories,
      tags: item.tags,
      attributes: item.attributes,
      dimensions: item.dimensions,
      basePrice: item.basePrice,
      currencyCode: item.currencyCode,
      costPrice: item.costPrice,
      msrp: item.msrp,
      salePrice: item.salePrice,
      saleStartDate: item.saleStartDate,
      saleEndDate: item.saleEndDate,
      stockLevels: item.stockLevels,
      totalStock: item.totalStock,
      marketplaces: item.marketplaces,
      status: item.status,
      supplierId: item.supplierId,
      supplierSku: item.supplierSku,
      leadTime: item.leadTime,
      minimumOrderQuantity: item.minimumOrderQuantity,
      isDigital: item.isDigital,
      isTaxable: item.isTaxable,
      taxRate: item.taxRate,
      internalNotes: item.internalNotes,
      externalProductId: item.externalProductId,
      createdBy: item.createdBy,
      createdAt: item.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): FirestoreInventoryItemWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      orgId: data.orgId,
      sku: data.sku,
      barcode: data.barcode,
      title: data.title,
      description: data.description,
      imageUrls: data.imageUrls,
      categories: data.categories,
      tags: data.tags,
      attributes: data.attributes,
      dimensions: data.dimensions,
      basePrice: data.basePrice,
      currencyCode: data.currencyCode,
      costPrice: data.costPrice,
      msrp: data.msrp,
      salePrice: data.salePrice,
      saleStartDate: data.saleStartDate,
      saleEndDate: data.saleEndDate,
      stockLevels: data.stockLevels,
      totalStock: data.totalStock,
      marketplaces: data.marketplaces,
      status: data.status,
      supplierId: data.supplierId,
      supplierSku: data.supplierSku,
      leadTime: data.leadTime,
      minimumOrderQuantity: data.minimumOrderQuantity,
      isDigital: data.isDigital,
      isTaxable: data.isTaxable,
      taxRate: data.taxRate,
      internalNotes: data.internalNotes,
      externalProductId: data.externalProductId,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as FirestoreInventoryItemWithId;
  }
};
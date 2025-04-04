/**
 * Xero Account Mapping Model (Firestore)
 */
import { Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { xeroAccountMappingCollection } from '../../../config/firestore';
import { AccountMapping } from '../types';

/**
 * Xero account mapping interface with timestamps
 */
export interface IXeroAccountMapping extends AccountMapping {
  userId?: string;
  organizationId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IXeroAccountMappingWithId extends IXeroAccountMapping {
  id: string;
}

/**
 * Converter for Firestore
 */
export const xeroAccountMappingConverter = {
  toFirestore(mapping: IXeroAccountMapping): DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      userId: mapping.userId,
      organizationId: mapping.organizationId,
      fluxoriCategoryId: mapping.fluxoriCategoryId,
      fluxoriCategory: mapping.fluxoriCategory,
      xeroAccountId: mapping.xeroAccountId,
      xeroAccountCode: mapping.xeroAccountCode,
      xeroAccountName: mapping.xeroAccountName,
      isDefault: typeof mapping.isDefault === 'boolean' ? mapping.isDefault : false,
      createdAt: mapping.createdAt instanceof Date 
        ? Timestamp.fromDate(mapping.createdAt) 
        : mapping.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: QueryDocumentSnapshot): IXeroAccountMappingWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      fluxoriCategoryId: data.fluxoriCategoryId,
      fluxoriCategory: data.fluxoriCategory,
      xeroAccountId: data.xeroAccountId,
      xeroAccountCode: data.xeroAccountCode,
      xeroAccountName: data.xeroAccountName,
      isDefault: data.isDefault,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};

// Apply the converter to the collection
const XeroAccountMappingCollectionWithConverter = 
  xeroAccountMappingCollection.withConverter(xeroAccountMappingConverter);

/**
 * Helper functions for XeroAccountMapping operations
 */
export const XeroAccountMapping = {
  /**
   * Create a new Xero account mapping
   */
  async create(mapping: IXeroAccountMapping): Promise<IXeroAccountMappingWithId> {
    const docRef = await XeroAccountMappingCollectionWithConverter.add(mapping);
    const snapshot = await docRef.get();
    const data = snapshot.data();
    if (!data) {
      throw new Error('Failed to create Xero account mapping');
    }
    return data;
  },

  /**
   * Get a Xero account mapping by ID
   */
  async findById(id: string): Promise<IXeroAccountMappingWithId | null> {
    const snapshot = await XeroAccountMappingCollectionWithConverter.doc(id).get();
    return snapshot.exists ? snapshot.data() as IXeroAccountMappingWithId : null;
  },

  /**
   * Find Xero account mapping by category ID
   */
  async findByFluxoriCategoryId(categoryId: string): Promise<IXeroAccountMappingWithId | null> {
    const snapshot = await XeroAccountMappingCollectionWithConverter
      .where('fluxoriCategoryId', '==', categoryId)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IXeroAccountMappingWithId;
  },

  /**
   * Find default Xero account mapping
   */
  async findDefault(): Promise<IXeroAccountMappingWithId | null> {
    const snapshot = await XeroAccountMappingCollectionWithConverter
      .where('isDefault', '==', true)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IXeroAccountMappingWithId;
  },

  /**
   * Find all mappings for an organization
   */
  async findByOrganizationId(organizationId: string): Promise<IXeroAccountMappingWithId[]> {
    const snapshot = await XeroAccountMappingCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as IXeroAccountMappingWithId);
  },

  /**
   * Update a Xero account mapping
   */
  async update(id: string, mappingData: Partial<IXeroAccountMapping>): Promise<void> {
    const now = Timestamp.now();
    await XeroAccountMappingCollectionWithConverter.doc(id).update({
      ...mappingData,
      updatedAt: now
    });
  },

  /**
   * Delete a Xero account mapping
   */
  async delete(id: string): Promise<void> {
    await XeroAccountMappingCollectionWithConverter.doc(id).delete();
  }
};

export default XeroAccountMapping;
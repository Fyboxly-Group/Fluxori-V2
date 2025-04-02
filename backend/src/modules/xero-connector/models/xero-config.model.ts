/**
 * Xero Config Model (Firestore)
 */
import { Timestamp } from 'firebase-admin/firestore';
import { xeroConfigCollection } from '../../../config/firestore';
import { XeroConfig as XeroConfigType } from '../types';

/**
 * Xero config interface with timestamps
 */
export interface IXeroConfig extends XeroConfigType {
  userId?: string;
  organizationId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IXeroConfigWithId extends IXeroConfig {
  id: string;
}

/**
 * Converter for Firestore
 */
export const xeroConfigConverter = {
  toFirestore(config: IXeroConfig): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      userId: config.userId,
      organizationId: config.organizationId,
      defaultAccountCode: config.defaultAccountCode,
      defaultTaxType: config.defaultTaxType,
      autoSyncInvoices: typeof config.autoSyncInvoices === 'boolean' ? config.autoSyncInvoices : true,
      autoSyncContacts: typeof config.autoSyncContacts === 'boolean' ? config.autoSyncContacts : true,
      autoSyncPayments: typeof config.autoSyncPayments === 'boolean' ? config.autoSyncPayments : false,
      invoiceNumberPrefix: config.invoiceNumberPrefix,
      invoiceTemplate: config.invoiceTemplate,
      defaultDueDays: config.defaultDueDays || 30,
      categoryAccountMappings: config.categoryAccountMappings || {},
      productAccountMappings: config.productAccountMappings || {},
      createdAt: config.createdAt instanceof Date 
        ? Timestamp.fromDate(config.createdAt) 
        : config.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IXeroConfigWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      organizationId: data.organizationId,
      defaultAccountCode: data.defaultAccountCode,
      defaultTaxType: data.defaultTaxType,
      autoSyncInvoices: data.autoSyncInvoices,
      autoSyncContacts: data.autoSyncContacts,
      autoSyncPayments: data.autoSyncPayments,
      invoiceNumberPrefix: data.invoiceNumberPrefix,
      invoiceTemplate: data.invoiceTemplate,
      defaultDueDays: data.defaultDueDays,
      categoryAccountMappings: data.categoryAccountMappings,
      productAccountMappings: data.productAccountMappings,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IXeroConfigWithId;
  }
};

// Apply the converter to the collection
const XeroConfigCollectionWithConverter = 
  xeroConfigCollection.withConverter(xeroConfigConverter);

/**
 * Helper functions for XeroConfig operations
 */
export const XeroConfig = {
  /**
   * Create a new Xero config
   */
  async create(config: IXeroConfig): Promise<IXeroConfigWithId> {
    const docRef = await XeroConfigCollectionWithConverter.add(config);
    const snapshot = await docRef.get();
    return snapshot.data() as IXeroConfigWithId;
  },

  /**
   * Get a Xero config by ID
   */
  async findById(id: string): Promise<IXeroConfigWithId | null> {
    const snapshot = await XeroConfigCollectionWithConverter.doc(id).get();
    return snapshot.exists ? snapshot.data() as IXeroConfigWithId : null;
  },

  /**
   * Find Xero config by organization ID
   */
  async findByOrganizationId(organizationId: string): Promise<IXeroConfigWithId | null> {
    const snapshot = await XeroConfigCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : snapshot.docs[0].data() as IXeroConfigWithId;
  },

  /**
   * Update a Xero config
   */
  async update(id: string, configData: Partial<IXeroConfig>): Promise<void> {
    const now = Timestamp.now();
    await XeroConfigCollectionWithConverter.doc(id).update({
      ...configData,
      updatedAt: now
    });
  },

  /**
   * Delete a Xero config
   */
  async delete(id: string): Promise<void> {
    await XeroConfigCollectionWithConverter.doc(id).delete();
  }
};

export default XeroConfig;
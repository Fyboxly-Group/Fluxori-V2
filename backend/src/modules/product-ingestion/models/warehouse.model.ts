/**
 * Warehouse Model (Firestore)
 */
import { Timestamp } from 'firebase-admin/firestore';
import { warehousesCollection } from '../../../config/firestore';

/**
 * Warehouse type enum
 */
export enum WarehouseType {
  OWN = 'own',
  THIRD_PARTY = 'third_party',
  MARKETPLACE = 'marketplace'
}

/**
 * Warehouse location interface
 */
export interface WarehouseLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Warehouse interface
 */
export interface IWarehouse {
  name: string;
  type: WarehouseType;
  location: WarehouseLocation;
  isActive: boolean;
  organizationId: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Interface for Firestore document with ID
 */
export interface IWarehouseWithId extends IWarehouse {
  id: string;
}

/**
 * Converter for Firestore
 */
export const warehouseConverter = {
  toFirestore(warehouse: IWarehouse): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    
    return {
      name: warehouse.name,
      type: warehouse.type || WarehouseType.OWN,
      location: warehouse.location,
      isActive: typeof warehouse.isActive === 'boolean' ? warehouse.isActive : true,
      organizationId: warehouse.organizationId,
      createdAt: warehouse.createdAt instanceof Date 
        ? Timestamp.fromDate(warehouse.createdAt) 
        : warehouse.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): IWarehouseWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      type: data.type,
      location: data.location,
      isActive: data.isActive,
      organizationId: data.organizationId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IWarehouseWithId;
  }
};

// Apply the converter to the collection
const WarehousesCollectionWithConverter = 
  warehousesCollection.withConverter(warehouseConverter);

/**
 * Helper functions for Warehouse operations
 */
export const Warehouse = {
  /**
   * Create a new warehouse
   */
  async create(warehouse: IWarehouse): Promise<IWarehouseWithId> {
    const docRef = await WarehousesCollectionWithConverter.add(warehouse);
    const snapshot = await docRef.get();
    return snapshot.data() as IWarehouseWithId;
  },

  /**
   * Get a warehouse by ID
   */
  async findById(id: string): Promise<IWarehouseWithId | null> {
    const snapshot = await WarehousesCollectionWithConverter.doc(id).get();
    return snapshot.exists ? snapshot.data() as IWarehouseWithId : null;
  },

  /**
   * Find warehouses by organization ID
   */
  async findByOrganizationId(organizationId: string): Promise<IWarehouseWithId[]> {
    const snapshot = await WarehousesCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .get();
    return snapshot.docs.map(doc => doc.data() as IWarehouseWithId);
  },

  /**
   * Find active warehouses by organization ID
   */
  async findActiveByOrganizationId(organizationId: string): Promise<IWarehouseWithId[]> {
    const snapshot = await WarehousesCollectionWithConverter
      .where('organizationId', '==', organizationId)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => doc.data() as IWarehouseWithId);
  },

  /**
   * Update a warehouse
   */
  async update(id: string, warehouseData: Partial<IWarehouse>): Promise<void> {
    const now = Timestamp.now();
    await WarehousesCollectionWithConverter.doc(id).update({
      ...warehouseData,
      updatedAt: now
    });
  },

  /**
   * Delete a warehouse
   */
  async delete(id: string): Promise<void> {
    await WarehousesCollectionWithConverter.doc(id).delete();
  }
};

export default Warehouse;
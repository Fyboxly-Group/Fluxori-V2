/**
 * Global type declarations for backend
 */

// Define a WithId utility type
export type WithId<T> = T & { id: string };

// Define Firebase Timestamp interface
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  valueOf(): number;
  isEqual(other: Timestamp): boolean;
}

// Make Date class compatible with Timestamp
declare global {
  interface Date {
    toMillis?(): number;
  }
}

// Define AddPrefixToKeys utility type
export type AddPrefixToKeys<P extends string, T> = {
  [K in keyof T as `${P}.${string & K}`]: T[K];
} & {
  [key: string]: any;
};

// Define BuyBox interfaces
export interface IBuyBoxMonitor {
  marketplaceId: string;
  addSnapshot(data: any): Promise<void>;
  [key: string]: any;
}

export interface IBuyBoxHistoryRepository {
  getRules(itemId: string): Promise<any[]>;
  [key: string]: any;
}

// Define common model interfaces with ID
export interface IUserWithId {
  id: string;
  [key: string]: any;
}

export interface IUserOrganizationWithId {
  id: string;
  [key: string]: any;
}

export interface IInvitationWithId {
  id: string;
  [key: string]: any;
}

export interface FirestoreInventoryItemWithId {
  id: string;
  [key: string]: any;
}

export interface FirestoreOrderWithId {
  id: string;
  [key: string]: any;
}

export interface IFeedbackWithId {
  id: string;
  [key: string]: any;
}

// Define Express extension for multi-tenant auth
declare global {
  namespace Express {
    interface Request {
      user?: any;
      organizationId?: string;
    }
  }
}

// Define auth user interfaces
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}

export interface MultiTenantUser extends AuthUser {
  organizationId?: string;
  role?: string;
  permissions?: string[];
}

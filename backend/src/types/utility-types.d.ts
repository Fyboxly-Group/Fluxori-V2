/**
 * Utility type declarations for the backend
 */

// Adds ID property to any interface
export type WithId<T> = T & {
  id: string;
};

// Makes all properties of an interface optional
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Firebase Timestamp type
export interface Timestamp {
  toDate(): Date;
  toMillis(): number;
  valueOf(): number;
  isEqual(other: Timestamp): boolean;
}

// Helper type for AddPrefixToKeys utility
export type AddPrefixToKeys<P extends string, T> = {
  [K in keyof T as `${P}.${string & K}`]: T[K];
} & {
  [key: string]: any;
};

// Make Date class compatible with Timestamp
declare global {
  interface Date {
    toMillis?(): number;
  }
}

// Common interfaces
export interface IUserWithId extends IUser {
  id: string;
}

export interface IUserOrganizationWithId extends IUserOrganization {
  id: string;
}

export interface IInvitationWithId extends IInvitation {
  id: string;
}

export interface FirestoreInventoryItemWithId extends FirestoreInventoryItem {
  id: string;
}

export interface FirestoreOrderWithId extends FirestoreOrder {
  id: string;
}

export interface IFeedbackWithId extends IFeedback {
  id: string;
}

// BuyBox interfaces
export interface IBuyBoxMonitor {
  marketplaceId: string;
  addSnapshot(data: any): Promise<void>;
  [key: string]: any;
}

export interface IBuyBoxHistoryRepository {
  getRules(itemId: string): Promise<any[]>;
  [key: string]: any;
}

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

// Nullable and optional types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybeNull<T> = T | null;
export type MaybeUndefined<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Collection types
export type Dictionary<T> = Record<string, T>;
export type StringKeyObject = Record<string, unknown>;
export type JsonObject = Record<string, unknown>;
export type IndexableObject<T = any> = { [key: string]: T };

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type AsyncFunctionWithArg<T, R = void> = (arg: T) => Promise<R>;
export type Callback<T = void> = (error?: Error | null, result?: T) => void;

// Result types
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// API response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string | Error;
  message?: string;
  statusCode?: number;
};

// Pagination types
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
};

// ID types
export type ID = string;
export type MongooseId = string | { _id: string; toString(): string };

// Enum conversion utilities
export type EnumValues<T> = T[keyof T];
export type StringValues<T extends Record<string, string>> = T[keyof T];

// Framework-specific types
export type RouteHandler = (req: any, res: any, next: any) => Promise<void> | void;
export type MiddlewareFunction = (req: any, res: any, next: any) => void;

// Utility to make specific properties required in an interface
export type RequiredProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make all properties in T optional
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Omit a set of properties from an object type
export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

// Pick a set of properties from an object type
export type PickProperties<T, K extends keyof T> = Pick<T, K>;

// Remove null or undefined from a type
export type NonNullable<T> = T extends null | undefined ? never : T;

// Extract the type of an array element
export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Extract the resolved type from a Promise
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// Utility for typing Promise.all with tuple types
export type PromiseAllTuple<T extends readonly unknown[]> = 
  { [P in keyof T]: Awaited<T[P]> };

// Helper for Promise.all
export const typedPromiseAll = <T extends readonly unknown[]>(promises: T): Promise<PromiseAllTuple<T>> => {
  return Promise.all(promises) as Promise<PromiseAllTuple<T>>;
};

// Convert a union type to an intersection type
export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// Make Date class compatible with Timestamp
declare global {
  interface Date {
    toMillis?(): number;
  }
}

// Common interfaces with ID
// These interfaces extend their base interfaces by adding an ID property
// The base interfaces are imported from their respective module files

// User interfaces
interface IUserBase {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt: Date | any; // Timestamp
  updatedAt: Date | any; // Timestamp
}

export interface IUser extends IUserBase {
  // Base user properties already defined
}

export interface IUserWithId extends IUserBase {
  id: string;
}

// UserOrganization interfaces
interface IUserOrganizationBase {
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | any; // Timestamp
  updatedAt: Date | any; // Timestamp
}

export interface IUserOrganization extends IUserOrganizationBase {
  // Base properties already defined
}

export interface IUserOrganizationWithId extends IUserOrganizationBase {
  id: string;
}

// Invitation interfaces
interface IInvitationBase {
  email: string;
  organizationId: string;
  role: string;
  status: string;
  expiresAt: Date | any; // Timestamp
  createdAt: Date | any; // Timestamp
  updatedAt: Date | any; // Timestamp
}

export interface IInvitation extends IInvitationBase {
  // Base properties already defined
}

export interface IInvitationWithId extends IInvitationBase {
  id: string;
}

// Inventory interfaces - import from their specific modules
import { FirestoreInventoryItem } from '../models/firestore/inventory.schema';

export interface FirestoreInventoryItemWithId extends FirestoreInventoryItem {
  id: string;
}

// Order interfaces
import { IOrder } from '../modules/order-ingestion/models/order.model';

export interface FirestoreOrderWithId extends IOrder {
  id: string;
}

// Feedback interfaces
interface IFeedbackBase {
  userId: string;
  content: string;
  rating?: number;
  category: string;
  createdAt: Date | any; // Timestamp
}

export interface IFeedback extends IFeedbackBase {
  // Base properties already defined
}

export interface IFeedbackWithId extends IFeedbackBase {
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

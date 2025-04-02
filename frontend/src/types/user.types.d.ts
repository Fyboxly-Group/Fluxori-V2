/**
 * User type definitions
 * Consolidated from multiple user.d.ts files to fix casing conflicts
 */

// Global interface declaration
declare interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

// Exportable interface
export interface UserExport {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

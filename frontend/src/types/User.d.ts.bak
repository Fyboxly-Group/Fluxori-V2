/**
 * User type definitions
 */

// This is a declarative type that will take precedence during build
declare interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean; // Non-optional to pass the type check
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface UserExport {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  organizationId?: string;
  isAdmin: boolean; // Non-optional to pass the type check
  permissions?: string[];
  metadata?: Record<string, any>;
  [key: string]: any;
}
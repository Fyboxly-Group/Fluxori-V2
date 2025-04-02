/**
 * Script to fix mongoose type conflicts in mongo-util-types.ts
 */
const fs = require('fs');
const path = require('path');

// File paths
const targetFile = path.join(__dirname, '../src/types/mongo-util-types.ts');
const backupFile = path.join(__dirname, '../src/types/mongo-util-types.ts.bak');

// Backup the original file
if (fs.existsSync(targetFile)) {
  console.log('Creating backup of original file...');
  fs.copyFileSync(targetFile, backupFile);
}

// Define the fixed types content
const newTypesContent = `/**
 * Utility types for Mongoose used throughout the application
 */
import { Document, Model, Schema } from 'mongoose';

/**
 * Type for a document before it is saved to the database
 */
export interface CreateDocumentType<T> {
  [key: string]: any;
}

/**
 * Type for a document update
 */
export interface UpdateDocumentType<T> {
  [key: string]: any;
}

/**
 * Type for a mongoose pre-save hook callback
 */
export type PreHookCallback = (err?: Error) => void;

/**
 * Type for a mongoose post-save hook callback
 */
export type PostHookCallback = (err?: Error, doc?: Document) => void;

// Re-export mongoose types to avoid conflicts
export { Document, Model, Schema };
`;

// Write the new file
console.log('Writing new mongo-util-types.ts file...');
fs.writeFileSync(targetFile, newTypesContent);

console.log('Successfully fixed mongo-util-types.ts');
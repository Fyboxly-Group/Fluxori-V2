/**
 * Firestore Configuration
 * 
 * This module initializes and exports Firestore related functionality for Fluxori-V2.
 */
import admin from 'firebase-admin';
import config from './index';

// Initialize Firebase if not already initialized
if (!admin.apps.length) {
  // Check for service account credentials
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account credentials from environment
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else {
    // Use service account credentials from environment variables (for development)
    try {
      // For local development, you can define this in your .env file as a JSON string
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        : undefined;

      admin.initializeApp({
        credential: serviceAccount 
          ? admin.credential.cert(serviceAccount)
          : admin.credential.applicationDefault()
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback to application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  }
}

// Get Firestore database instance
const db = admin.firestore();

// Set Firestore settings based on environment
if (config.isDev) {
  // Set Firestore to use local emulator in development mode if emulator address is provided
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false
    });
    console.log(`Using Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }
}

// Define collection references
const ordersCollection = db.collection('orders');
const inventoryCollection = db.collection('inventory');
const conversationsCollection = db.collection('conversations');
const creditBalancesCollection = db.collection('creditBalances');
const creditTransactionsCollection = db.collection('creditTransactions');
const notificationsCollection = db.collection('notifications');
const marketplaceConnectionsCollection = db.collection('marketplaceConnections');
const internationalTradeCollection = db.collection('internationalTrade');
const productSyncConfigCollection = db.collection('productSyncConfig');
const warehousesCollection = db.collection('warehouses');
const xeroConnectionsCollection = db.collection('xeroConnections');
const xeroConfigCollection = db.collection('xeroConfig');
const xeroAccountMappingCollection = db.collection('xeroAccountMapping');
const xeroSyncStatusCollection = db.collection('xeroSyncStatus');
const feedbackCollection = db.collection('feedback');

// Multi-account architecture collections
const organizationsCollection = db.collection('organizations');
const rolesCollection = db.collection('roles');
const userOrganizationsCollection = db.collection('userOrganizations');
const invitationsCollection = db.collection('invitations');
const auditLogsCollection = db.collection('auditLogs');
const resourceSharingCollection = db.collection('resourceSharing');
const firebaseUsersCollection = db.collection('users');

export {
  admin,
  db,
  ordersCollection,
  inventoryCollection,
  conversationsCollection,
  creditBalancesCollection,
  creditTransactionsCollection,
  notificationsCollection,
  marketplaceConnectionsCollection,
  internationalTradeCollection,
  productSyncConfigCollection,
  warehousesCollection,
  xeroConnectionsCollection,
  xeroConfigCollection,
  xeroAccountMappingCollection,
  xeroSyncStatusCollection,
  feedbackCollection,
  
  // Multi-account architecture collections
  organizationsCollection,
  rolesCollection,
  userOrganizationsCollection,
  invitationsCollection,
  auditLogsCollection,
  resourceSharingCollection,
  firebaseUsersCollection
};
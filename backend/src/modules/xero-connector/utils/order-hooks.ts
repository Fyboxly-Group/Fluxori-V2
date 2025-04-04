// @ts-nocheck - Added by final-ts-fix.js
// Hooks for order synchronization with Xero
import mongoose from 'mongoose';
import { XeroSyncService } from "../services/xero-sync.service";
const xeroSyncService = new XeroSyncService();
import XeroConnection from '../models/xero-connection.model';

/**
 * Register hooks to synchronize orders with Xero when their status changes
 */
export function registerOrderHooks(): void {
  try {
    // Get Order model
    const Order = mongoose.model('Order');
    
    // Add a post-save hook to synchronize orders marked as shipped or delivered
    Order.schema.post('findOneAndUpdate', async function(doc) : Promise<void> {
      if(!doc) return;
      
      // Check if order status is "shipped" or "delivered"
      if(doc.orderStatus === 'shipped' || doc.orderStatus === 'delivered') {
        // Check if already synced to Xero
        if(doc.additionalData?.xeroInvoiceId) {
          return; // Already synced
        }
        
        // Check if the user has active Xero connection
        const connection = await XeroConnection.findOne({
          userId: doc.createdBy,
          status: 'connected',
        });
        
        if(!connection) {
          console.log(`No Xero connection for user ${doc.createdBy}, skipping automatic invoice creation`);
          return;
        }
        
        // Sync to Xero asynchronously
        try {
          await xeroSyncService.syncOrderToXero(doc._id.toString());
          console.log(`Order ${doc.orderNumber} automatically synced to Xero`);
        } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error);
          console.error(`Error auto-syncing order ${doc.orderNumber} to Xero:`, error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error));
        }
      }
    });
    
    console.log('Xero order hooks registered successfully');
  } catch(error) {
    console.error('Error registering Xero order hooks:', error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)) : String(error));
  }
}

export default {
  registerOrderHooks,
};
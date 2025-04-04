// @ts-nocheck - Added by final-ts-fix.js
import mongoose from 'mongoose';
import Inventory from '../models/inventory.model';
import InventoryAlert from '../models/inventory-alert.model';
import Activity from '../models/activity.model';
import { AlertType, AlertStatus } from '../models/inventory-alert.model';

/**
 * Interface for Organization-wide inventory check
 */
export interface IOrganizationInventoryCheck {
  organizationId: mongoose.Types.ObjectId | string;
}

/**
 * Service for checking inventory reorder levels and creating alerts
 */
export class InventoryReorderCheckService {
  /**
   * Check inventory levels across the organization and create alerts for items below reorder threshold
   * @param params Object containing organizationId
   * @returns Summary of check results
   */
  public static async checkOrganizationInventory(
    params: IOrganizationInventoryCheck
  ): Promise<{ 
    success: boolean; 
    lowStockItems: number; 
    alertsCreated: number; 
    errors?: string[] 
  }> {
    try {
      const { organizationId } = params;
      const errors: string[] = [];
      
      // Find inventory items where stock quantity is below reorder point
      const lowStockItems = await Inventory.find({
        organizationId,
        $or: [
          // Traditional inventory check (total stock)
          { stockQuantity: { $lt: '$reorderPoint' } },
          // Warehouse-specific stock check
          { 'warehouseStock.quantity': { $lt: '$reorderPoint' } }
        ]
      });
      
      // Create alerts for low stock items
      let alertsCreated = 0;
      
      for (const item of lowStockItems) {
        try {
          // Check if there's already an active alert for this item
          const existingAlert = await InventoryAlert.findOne({
            inventoryId: item._id,
            alertType: AlertType.LOW_STOCK,
            status: AlertStatus.ACTIVE,
            organizationId
          });
          
          // If no active alert exists, create one
          if (!existingAlert) {
            const alert = await InventoryAlert.create({
              inventoryId: item._id,
              alertType: AlertType.LOW_STOCK,
              description: `Low stock alert for ${item.name} (SKU: ${item.sku})`,
              threshold: item.reorderPoint,
              status: AlertStatus.ACTIVE,
              notificationSent: false,
              userId: item.createdBy,
              organizationId
            });
            
            // Log activity
            await Activity.create({
              type: 'inventory_alert_created',
              description: `Low stock alert created for ${item.name} (SKU: ${item.sku})`,
              details: {
                inventoryId: item._id,
                alertId: alert._id,
                currentStock: item.stockQuantity,
                reorderPoint: item.reorderPoint
              },
              userId: item.createdBy,
              organizationId
            });
            
            alertsCreated++;
          }
        } catch (itemError) {
          console.error(`Error creating alert for item ${item._id}:`, itemError);
          errors.push(`Failed to process item ${item.sku}: ${(itemError as Error).message}`);
        }
      }
      
      return {
        success: true,
        lowStockItems: lowStockItems.length,
        alertsCreated,
        ...(errors.length > 0 && { errors })
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error in inventory reorder check:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
  
  /**
   * Check inventory levels for a specific warehouse and create alerts for items below reorder threshold
   * @param warehouseId The warehouse ID to check
   * @param organizationId The organization ID
   * @returns Summary of check results
   */
  public static async checkWarehouseInventory(
    warehouseId: mongoose.Types.ObjectId | string,
    organizationId: mongoose.Types.ObjectId | string
  ): Promise<{ 
    success: boolean; 
    lowStockItems: number; 
    alertsCreated: number; 
    errors?: string[] 
  }> {
    try {
      const errors: string[] = [];
      
      // Find inventory items where warehouse-specific stock is below reorder point
      const lowStockItems = await Inventory.find({
        organizationId,
        'warehouseStock.warehouseId': warehouseId,
        $expr: {
          $lt: [
            { $arrayElemAt: [
              '$warehouseStock.quantity',
              { $indexOfArray: ['$warehouseStock.warehouseId', warehouseId] }
            ]},
            '$reorderPoint'
          ]
        }
      });
      
      // Create alerts for low stock items
      let alertsCreated = 0;
      
      for (const item of lowStockItems) {
        try {
          // Check if there's already an active alert for this item in this warehouse
          const existingAlert = await InventoryAlert.findOne({
            inventoryId: item._id,
            alertType: AlertType.LOW_STOCK,
            status: AlertStatus.ACTIVE,
            warehouseId,
            organizationId
          });
          
          // If no active alert exists, create one
          if (!existingAlert) {
            const warehouseStock = item.warehouseStock?.find((ws: any) => ws.warehouseId.toString() === warehouseId.toString()
            );
            
            const currentStock = warehouseStock?.quantity || 0;
            
            const alert = await InventoryAlert.create({
              inventoryId: item._id,
              alertType: AlertType.LOW_STOCK,
              description: `Low stock alert for ${item.name} (SKU: ${item.sku}) in warehouse`,
              threshold: item.reorderPoint,
              status: AlertStatus.ACTIVE,
              notificationSent: false,
              warehouseId,
              userId: item.createdBy,
              organizationId
            });
            
            // Log activity
            await Activity.create({
              type: 'inventory_alert_created',
              description: `Low stock alert created for ${item.name} (SKU: ${item.sku}) in warehouse`,
              details: {
                inventoryId: item._id,
                alertId: alert._id,
                warehouseId,
                currentStock,
                reorderPoint: item.reorderPoint
              },
              userId: item.createdBy,
              organizationId
            });
            
            alertsCreated++;
          }
        } catch (itemError) {
          console.error(`Error creating alert for item ${item._id}:`, itemError);
          errors.push(`Failed to process item ${item.sku}: ${(itemError as Error).message}`);
        }
      }
      
      return {
        success: true,
        lowStockItems: lowStockItems.length,
        alertsCreated,
        ...(errors.length > 0 && { errors })
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error in warehouse inventory check:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

export default InventoryReorderCheckService;
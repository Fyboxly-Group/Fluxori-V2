// TypeScript checked
import * as express from "express";
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as inventoryStockController from '../controllers/inventory-stock.controller';

const router = express.Router();

// Base path: /api/inventory

// Get low stock items(new endpoint using warehouse-specific stock)
router.get('/low-stock/warehouse', authenticate, inventoryStockController.getLowStockItems);

// Get inventory stock levels by item ID
router.get('/:id/stock', authenticate, inventoryStockController.getInventoryStockByItem);

// Update inventory stock for a specific warehouse
router.put('/:id/stock/:warehouseId', authenticate, authorize('admin', 'manager', 'staff'), inventoryStockController.updateInventoryStock);

// Transfer inventory between warehouses
router.post('/:id/transfer', authenticate, authorize('admin', 'manager', 'staff'), inventoryStockController.transferInventory);

export default router;
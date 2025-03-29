import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import InventoryItem from '../models/inventory.model';
import InventoryAlert from '../models/inventory-alert.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory items with filtering and pagination
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, SKU, or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *         description: Filter by supplier ID
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter for low stock items (quantity <= reorder point)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, sku, price, costPrice, stockQuantity, category]
 *         description: Field to sort by (default is name)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (default is asc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getInventoryItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      category,
      supplier,
      lowStock,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;
    
    const query: any = {};
    
    // Search by name, sku, or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (supplier) {
      query.supplier = new mongoose.Types.ObjectId(supplier as string);
    }
    
    // Filter for low stock items
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$reorderPoint'] };
    }
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Parse sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const items = await InventoryItem.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('supplier', 'name contactPerson email phone')
      .populate('createdBy', 'firstName lastName email')
      .catch(err => {
        console.error('Error in InventoryItem.find:', err);
        throw err;
      });
    
    // Get total count
    const total = await InventoryItem.countDocuments(query)
      .catch(err => {
        console.error('Error in InventoryItem.countDocuments:', err);
        throw err;
      });
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory item by ID
 * @route   GET /api/inventory/:id
 * @access  Private
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Get a single inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getInventoryItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid inventory item ID');
    }
    
    const item = await InventoryItem.findById(itemId)
      .populate('supplier', 'name contactPerson email phone address')
      .populate('createdBy', 'firstName lastName email')
      .catch(err => {
        console.error('Error in InventoryItem.findById:', err);
        throw err;
      });
    
    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }
    
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new inventory item
 * @route   POST /api/inventory
 * @access  Private
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - category
 *               - price
 *               - costPrice
 *               - supplier
 *             properties:
 *               sku:
 *                 type: string
 *                 description: Stock keeping unit (unique identifier)
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               category:
 *                 type: string
 *                 description: Product category
 *               price:
 *                 type: number
 *                 description: Selling price
 *               costPrice:
 *                 type: number
 *                 description: Purchase/cost price
 *               stockQuantity:
 *                 type: number
 *                 description: Current stock quantity
 *                 default: 0
 *               reorderPoint:
 *                 type: number
 *                 description: Quantity threshold for reordering
 *                 default: 5
 *               reorderQuantity:
 *                 type: number
 *                 description: Suggested quantity to reorder
 *                 default: 10
 *               supplier:
 *                 type: string
 *                 description: Supplier ID
 *               location:
 *                 type: string
 *                 description: Storage location
 *               dimensions:
 *                 type: object
 *                 properties:
 *                   length:
 *                     type: number
 *                   width:
 *                     type: number
 *                   height:
 *                     type: number
 *                   weight:
 *                     type: number
 *                   unit:
 *                     type: string
 *               barcode:
 *                 type: string
 *                 description: Product barcode
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               isActive:
 *                 type: boolean
 *                 description: Whether the item is active
 *                 default: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Keywords/tags for the product
 *               variations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     sku:
 *                       type: string
 *                     attributes:
 *                       type: object
 *                     price:
 *                       type: number
 *                     stockQuantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid input or SKU already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const createInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      price,
      costPrice,
      stockQuantity,
      reorderPoint,
      reorderQuantity,
      supplier,
      location,
      dimensions,
      barcode,
      images,
      isActive,
      tags,
      variations,
    } = req.body;
    
    // Validate required fields
    if (!sku || !name || !category || price === undefined || costPrice === undefined || !supplier) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(sku ? {} : { sku: ['SKU is required'] }),
        ...(name ? {} : { name: ['Name is required'] }),
        ...(category ? {} : { category: ['Category is required'] }),
        ...(price !== undefined ? {} : { price: ['Price is required'] }),
        ...(costPrice !== undefined ? {} : { costPrice: ['Cost price is required'] }),
        ...(supplier ? {} : { supplier: ['Supplier is required'] }),
      });
    }
    
    // Check if an item with the same SKU already exists
    const existingItem = await InventoryItem.findOne({ sku });
    if (existingItem) {
      throw new ApiError(400, `Inventory item with SKU "${sku}" already exists`);
    }
    
    // Create inventory item
    const item = new InventoryItem({
      sku,
      name,
      description,
      category,
      price,
      costPrice,
      stockQuantity: stockQuantity || 0,
      reorderPoint: reorderPoint || 5,
      reorderQuantity: reorderQuantity || 10,
      supplier,
      location,
      dimensions,
      barcode,
      images,
      isActive: isActive !== undefined ? isActive : true,
      tags,
      variations,
      createdBy: req.user?._id,
    });
    
    await item.save();
    
    // Check if we need to create a low stock alert
    if (stockQuantity <= reorderPoint) {
      const alert = new InventoryAlert({
        item: item._id,
        itemName: item.name,
        itemSku: item.sku,
        alertType: stockQuantity === 0 ? 'out-of-stock' : 'low-stock',
        status: 'active',
        priority: stockQuantity === 0 ? 'high' : 'medium',
        description: stockQuantity === 0 
          ? `Item ${item.name} (${item.sku}) is out of stock.` 
          : `Item ${item.name} (${item.sku}) has low stock (${stockQuantity} remaining).`,
        currentQuantity: stockQuantity,
        thresholdQuantity: reorderPoint,
        recommendedAction: `Order ${reorderQuantity} units from supplier.`,
        createdBy: req.user?._id,
      });
      
      await alert.save();
    }
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory item "${name}" (${sku}) created`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'create',
        status: 'completed',
        userId: req.user._id,
        metadata: { itemId: item._id },
      });
    }
    
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Update an existing inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *               reorderPoint:
 *                 type: number
 *               reorderQuantity:
 *                 type: number
 *               supplier:
 *                 type: string
 *               location:
 *                 type: string
 *               dimensions:
 *                 type: object
 *               barcode:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               variations:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid input or SKU conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const updateInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid inventory item ID');
    }
    
    // Find item
    const item = await InventoryItem.findById(itemId);
    
    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }
    
    const updates = req.body;
    const oldStockQuantity = item.stockQuantity;
    
    // Check if SKU is being changed and if the new SKU already exists
    if (updates.sku && updates.sku !== item.sku) {
      const existingItem = await InventoryItem.findOne({ 
        sku: updates.sku,
        _id: { $ne: itemId }
      });
      
      if (existingItem) {
        throw new ApiError(400, `Inventory item with SKU "${updates.sku}" already exists`);
      }
    }
    
    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        (item as any)[key] = updates[key];
      }
    });
    
    await item.save();
    
    // Check if we need to create stock alerts
    const newStockQuantity = item.stockQuantity;
    
    // Stock decreased to or below reorder point
    if (oldStockQuantity > item.reorderPoint && newStockQuantity <= item.reorderPoint) {
      const alert = new InventoryAlert({
        item: item._id,
        itemName: item.name,
        itemSku: item.sku,
        alertType: newStockQuantity === 0 ? 'out-of-stock' : 'low-stock',
        status: 'active',
        priority: newStockQuantity === 0 ? 'high' : 'medium',
        description: newStockQuantity === 0 
          ? `Item ${item.name} (${item.sku}) is out of stock.` 
          : `Item ${item.name} (${item.sku}) has low stock (${newStockQuantity} remaining).`,
        currentQuantity: newStockQuantity,
        thresholdQuantity: item.reorderPoint,
        recommendedAction: `Order ${item.reorderQuantity} units from supplier.`,
        createdBy: req.user?._id,
      });
      
      await alert.save();
    }
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory item "${item.name}" (${item.sku}) updated`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'update',
        status: 'completed',
        userId: req.user._id,
        metadata: { itemId: item._id, updates },
      });
    }
    
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private
 * @swagger
 * /inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inventory item deleted successfully
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const deleteInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid inventory item ID');
    }
    
    // Find item
    const item = await InventoryItem.findById(itemId);
    
    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }
    
    // Store item info for activity log
    const itemName = item.name;
    const itemSku = item.sku;
    
    // Delete item - using deleteOne instead of remove() as remove is deprecated
    await InventoryItem.deleteOne({ _id: itemId });
    
    // Delete associated alerts
    await InventoryAlert.deleteMany({ item: itemId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Inventory item "${itemName}" (${itemSku}) deleted`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'delete',
        status: 'completed',
        userId: req.user._id,
        metadata: { itemId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inventory stock
 * @route   PUT /api/inventory/:id/stock
 * @access  Private
 * @swagger
 * /inventory/{id}/stock:
 *   put:
 *     summary: Update the stock quantity of an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - adjustmentType
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: The quantity to set, add, or subtract
 *               adjustmentType:
 *                 type: string
 *                 enum: [set, add, subtract]
 *                 description: The type of adjustment to make
 *               reason:
 *                 type: string
 *                 description: Reason for the stock adjustment
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     sku:
 *                       type: string
 *                     name:
 *                       type: string
 *                     previousQuantity:
 *                       type: number
 *                     newQuantity:
 *                       type: number
 *                     adjustmentType:
 *                       type: string
 *                     reason:
 *                       type: string
 *       400:
 *         description: Invalid input or cannot subtract more than current stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Inventory item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const updateInventoryStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid inventory item ID');
    }
    
    const { quantity, adjustmentType, reason } = req.body;
    
    if (quantity === undefined) {
      throw new ApiError(400, 'Quantity is required');
    }
    
    if (!adjustmentType || !['set', 'add', 'subtract'].includes(adjustmentType)) {
      throw new ApiError(400, 'Valid adjustment type is required (set, add, or subtract)');
    }
    
    // Find item
    const item = await InventoryItem.findById(itemId);
    
    if (!item) {
      throw new ApiError(404, 'Inventory item not found');
    }
    
    const oldStockQuantity = item.stockQuantity;
    
    // Update stock based on adjustment type
    if (adjustmentType === 'set') {
      item.stockQuantity = quantity;
    } else if (adjustmentType === 'add') {
      item.stockQuantity += quantity;
    } else if (adjustmentType === 'subtract') {
      if (item.stockQuantity < quantity) {
        throw new ApiError(400, 'Cannot subtract more than current stock');
      }
      item.stockQuantity -= quantity;
    }
    
    await item.save();
    
    // Check if we need to create alerts
    const newStockQuantity = item.stockQuantity;
    
    // Stock decreased to or below reorder point
    if (oldStockQuantity > item.reorderPoint && newStockQuantity <= item.reorderPoint) {
      const alert = new InventoryAlert({
        item: item._id,
        itemName: item.name,
        itemSku: item.sku,
        alertType: newStockQuantity === 0 ? 'out-of-stock' : 'low-stock',
        status: 'active',
        priority: newStockQuantity === 0 ? 'high' : 'medium',
        description: newStockQuantity === 0 
          ? `Item ${item.name} (${item.sku}) is out of stock.` 
          : `Item ${item.name} (${item.sku}) has low stock (${newStockQuantity} remaining).`,
        currentQuantity: newStockQuantity,
        thresholdQuantity: item.reorderPoint,
        recommendedAction: `Order ${item.reorderQuantity} units from supplier.`,
        createdBy: req.user?._id,
      });
      
      await alert.save();
    }
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Stock ${adjustmentType === 'set' ? 'set to' : adjustmentType === 'add' ? 'increased by' : 'decreased by'} ${quantity} for "${item.name}" (${item.sku})`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'update',
        status: 'completed',
        userId: req.user._id,
        metadata: { 
          itemId: item._id, 
          oldQuantity: oldStockQuantity, 
          newQuantity: newStockQuantity,
          adjustmentType,
          reason,
        },
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        itemId: item._id,
        sku: item.sku,
        name: item.name,
        previousQuantity: oldStockQuantity,
        newQuantity: item.stockQuantity,
        adjustmentType,
        reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory statistics
 * @route   GET /api/inventory/stats
 * @access  Private
 * @swagger
 * /inventory/stats:
 *   get:
 *     summary: Get inventory statistics and metrics
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                       description: Total number of inventory items
 *                     activeItems:
 *                       type: number
 *                       description: Number of active inventory items
 *                     lowStockItems:
 *                       type: number
 *                       description: Number of items with low stock
 *                     outOfStockItems:
 *                       type: number
 *                       description: Number of items with zero stock
 *                     inventoryValue:
 *                       type: object
 *                       properties:
 *                         cost:
 *                           type: number
 *                           description: Total cost value of inventory
 *                         retail:
 *                           type: number
 *                           description: Total retail value of inventory
 *                         potentialProfit:
 *                           type: number
 *                           description: Potential profit if all items are sold
 *                     categoryBreakdown:
 *                       type: object
 *                       description: Breakdown of items by category
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getInventoryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total inventory count
    const totalItems = await InventoryItem.countDocuments();
    
    // Get active items count
    const activeItems = await InventoryItem.countDocuments({ isActive: true });
    
    // Get total inventory value
    const inventoryValue = await InventoryItem.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } },
          totalRetailValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
        }
      }
    ]);
    
    // Get low stock items count
    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { 
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', '$reorderPoint'] }
        ]
      }
    });
    
    // Get out of stock items count
    const outOfStockItems = await InventoryItem.countDocuments({ stockQuantity: 0 });
    
    // Get item count by category
    const categoryBreakdown = await InventoryItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Return formatted stats
    res.status(200).json({
      success: true,
      data: {
        totalItems,
        activeItems,
        lowStockItems,
        outOfStockItems,
        inventoryValue: inventoryValue.length > 0 ? {
          cost: inventoryValue[0].totalValue,
          retail: inventoryValue[0].totalRetailValue,
          potentialProfit: inventoryValue[0].totalRetailValue - inventoryValue[0].totalValue,
        } : {
          cost: 0,
          retail: 0,
          potentialProfit: 0,
        },
        categoryBreakdown: categoryBreakdown.reduce((acc: Record<string, number>, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock items
 * @route   GET /api/inventory/low-stock
 * @access  Private
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Get all low stock inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: Number of low stock items
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getLowStockItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$stockQuantity', '$reorderPoint'] }
    })
    .sort({ stockQuantity: 1 })
    .populate('supplier', 'name contactPerson email phone');
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
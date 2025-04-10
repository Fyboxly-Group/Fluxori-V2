/**
 * Multi-Warehouse Test Data Seed Script
 * 
 * This script generates sample data for testing the multi-warehouse inventory system.prop
 * It creates:
 * - Multiple warehouses
 * - Inventory items
 * - Stock levels across warehouses
 * - Some low stock conditions to test alerts
 */

import mongoose from 'mongoose';
import config from '../config';
import InventoryItem from '../models/inventory.model';
import Supplier from '../models/supplier.model';

// Declare model variables
let Warehouse: any;
let InventoryStock: any;

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize models after connection
    Warehouse = mongoose.model('Warehouse');
    InventoryStock = mongoose.model('InventoryStock');
    // Now we can proceed with the seed function
    seedData()
      .then(results => {
        console.log(`
    Seed Results:
    - Created ${results.warehouseCount} warehouses
    - Used ${results.supplierCount} suppliers
    - Used ${results.inventoryItemCount} inventory items
    - Created ${results.stockLevelCount} stock level records
    `);
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
      })
      .catch(error => {
        console.error('Seed process failed:', error);
        mongoose.disconnect();
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Mock user ID for created by fields
const mockUserId = new mongoose.Types.ObjectId();

// Sample data for warehouses
const warehouseData = [
  {
    name: 'Main Distribution Center',
    code: 'MAIN',
    address: {
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
    },
    contactPerson: 'John Smith',
    contactEmail: 'john@fluxori.com',
    contactPhone: '555-123-4567',
    isActive: true,
    isDefault: true,
    notes: 'Main warehouse with central distribution',
  },
  {
    name: 'East Coast Fulfillment',
    code: 'EAST',
    address: {
      street: '456 Atlantic Avenue',
      city: 'Boston',
      state: 'MA',
      postalCode: '02110',
      country: 'USA',
    },
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah@fluxori.com',
    contactPhone: '555-234-5678',
    isActive: true,
    isDefault: false,
    notes: 'East coast fulfillment center for faster shipping',
  },
  {
    name: 'Midwest Storage Facility',
    code: 'MIDW',
    address: {
      street: '789 Central Parkway',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    contactPerson: 'Mike Wilson',
    contactEmail: 'mike@fluxori.com',
    contactPhone: '555-345-6789',
    isActive: true,
    isDefault: false,
    notes: 'Midwest facility for bulk storage and distribution',
  }
];

// Sample data for suppliers
const supplierData = [
  {
    name: 'TechSupply Inc.',
    contactPerson: 'David Lee',
    email: 'david@techsupply.com',
    phone: '555-111-2222',
    address: {
      street: '100 Tech Boulevard',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'USA',
    },
    paymentTerms: 'Net 30',
    leadTime: 7,
    minimumOrderValue: 500,
    isActive: true,
    categories: ['Electronics', 'Computers', 'Accessories'],
    rating: 5,
  },
  {
    name: 'Office Solutions LLC',
    contactPerson: 'Emma Garcia',
    email: 'emma@officesolutions.com',
    phone: '555-333-4444',
    address: {
      street: '200 Office Park',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'USA',
    },
    paymentTerms: 'Net 15',
    leadTime: 3,
    minimumOrderValue: 250,
    isActive: true,
    categories: ['Office Supplies', 'Furniture', 'Paper Products'],
    rating: 4,
  },
  {
    name: 'Industrial Products Co.',
    contactPerson: 'Robert Chen',
    email: 'robert@industrialproducts.com',
    phone: '555-555-6666',
    address: {
      street: '300 Industrial Way',
      city: 'Pittsburgh',
      state: 'PA',
      postalCode: '15222',
      country: 'USA',
    },
    paymentTerms: 'Net 45',
    leadTime: 14,
    minimumOrderValue: 1000,
    isActive: true,
    categories: ['Industrial', 'Tools', 'Safety Equipment'],
    rating: 4,
  }
];

// Sample data for inventory items
const generateInventoryItems = (suppliers: any[]) => {
  const categories = [
    'Electronics', 
    'Office Supplies', 
    'Furniture', 
    'Accessories', 
    'Tools', 
    'Safety Equipment'
  ];
  
  const items = [];
  
  // Generate 20 inventory items
  for(let i = 1; i <= 20; i++) {
    const supplierIndex = Math.floor(Math.random() * suppliers.length);
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const costPrice = Math.round(Math.random() * 490 + 10); // 10-500
    const markupPercentage = Math.round(Math.random() * 50 + 20); // 20-70%
    const price = Math.round(costPrice * (1 + markupPercentage / 100));
    
    items.push({
      sku: `ITEM-${i.toString().padStart(3, '0')}`,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      category: categories[categoryIndex],
      price,
      costPrice,
      stockQuantity: 0, // Will be calculated from warehouse stock
      reorderPoint: Math.round(Math.random() * 20 + 5), // 5-25
      reorderQuantity: Math.round(Math.random() * 30 + 10), // 10-40
      supplier: suppliers[supplierIndex]._id,
      location: 'Legacy location field',
      barcode: `BARCODE-${i.toString().padStart(3, '0')}`,
      isActive: true,
      tags: [categories[categoryIndex], 'sample', 'test-data'],
      createdBy: mockUserId,
    });
  }
  
  return items;
};

// Generate stock levels for each item across warehouses
const generateStockLevels = (items: any[], warehouses: any[]) => {
  const stockLevels = [];
  
  for(const item of items) {
    let totalStock = 0;
    
    for(const warehouse of warehouses) {
      // Not all items will be in all warehouses
      if(Math.random() > 0.2) {
        const quantityOnHand = Math.round(Math.random() * 100 + 5); // 5-105
        const quantityAllocated = Math.round(Math.random() * 10); // 0-10
        const reorderPoint = Math.round(item.reorderPoint * (0.8 + Math.random() * 0.4)); // 80-120% of item's reorderPoint
        const reorderQuantity = Math.round(item.reorderQuantity * (0.8 + Math.random() * 0.4)); // 80-120% of item's reorderQuantity
        const preferredStockLevel = Math.round(reorderPoint * 3); // 3x reorder point
        
        totalStock += quantityOnHand;
        
        // Create some low stock conditions randomly
        const actualQuantity = Math.random() < 0.2 ? Math.round(reorderPoint * 0.5) : quantityOnHand;
        
        stockLevels.push({
          inventoryItem: item._id,
          warehouse: warehouse._id,
          quantityOnHand: actualQuantity,
          quantityAllocated,
          reorderPoint,
          reorderQuantity,
          preferredStockLevel,
          binLocation: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`,
          lastStockCheck: new Date(),
          createdBy: mockUserId,
        });
      }
    }
    
    // Update the total stock quantity on the inventory item
    item.stockQuantity = totalStock;
  }
  
  return stockLevels;
};

// Seed data function
const seedData = async() => {
  try {
    // Clean up existing data
    await Warehouse.deleteMany({});
    await InventoryStock.deleteMany({});
    
    // Check if suppliers exist, create them if not
    const supplierCount = await Supplier.countDocuments();
    let suppliers = [];
    
    if(supplierCount === 0) {
      console.log('Creating suppliers...');
      const supplierPromises = supplierData.map((supplier: any) => 
        Supplier.create({
          ...supplier,
          createdBy: mockUserId,
        })
      );
      suppliers = await Promise.all(supplierPromises);
      console.log(`Created ${suppliers.length} suppliers`);
    } else {
      console.log('Using existing suppliers...');
      suppliers = await Supplier.find();
    }
    
    // Create warehouses
    console.log('Creating warehouses...');
    const warehousePromises = warehouseData.map((warehouse: any) => 
      Warehouse.create({
        ...warehouse,
        createdBy: mockUserId,
      })
    );
    const warehouses = await Promise.all(warehousePromises);
    console.log(`Created ${warehouses.length} warehouses`);
    
    // Check if inventory items exist, create them if not
    const inventoryItemCount = await InventoryItem.countDocuments();
    let inventoryItems = [];
    
    if(inventoryItemCount === 0) {
      console.log('Creating inventory items...');
      const itemsData = generateInventoryItems(suppliers);
      inventoryItems = await InventoryItem.create(itemsData);
      console.log(`Created ${inventoryItems.length} inventory items`);
    } else {
      console.log('Using existing inventory items...');
      inventoryItems = (await InventoryItem.find() as any).lean();
    }
    
    // Create inventory stock levels
    console.log('Creating inventory stock levels...');
    const stockLevelsData = generateStockLevels(inventoryItems, warehouses);
    await InventoryStock.create(stockLevelsData);
    console.log(`Created ${stockLevelsData.length} stock level records`);
    
    // Update total stock quantities on inventory items
    for(const item of inventoryItems) {
      await InventoryItem.findByIdAndUpdate(item._id, { stockQuantity: item.stockQuantity });
    }
    
    console.log('Seed data created successfully!');
    
    return {
      warehouseCount: warehouses.length,
      supplierCount: suppliers.length,
      inventoryItemCount: inventoryItems.length,
      stockLevelCount: stockLevelsData.length,
    };
  } catch(error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

// The seedData function is now called within the mongoose.connect().then() block
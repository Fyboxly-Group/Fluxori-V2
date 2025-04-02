# Multi-Warehouse Inventory API Documentation

This document describes the API endpoints for the multi-warehouse inventory management system.

## Table of Contents

- [Warehouses](#warehouses)
  - [Get All Warehouses](#get-all-warehouses)
  - [Get Warehouse by ID](#get-warehouse-by-id)
  - [Create Warehouse](#create-warehouse)
  - [Update Warehouse](#update-warehouse)
  - [Delete Warehouse](#delete-warehouse)
  - [Get Warehouse Inventory](#get-warehouse-inventory)
  - [Get Warehouse Statistics](#get-warehouse-statistics)
- [Inventory Stock](#inventory-stock)
  - [Get Inventory Stock by Item ID](#get-inventory-stock-by-item-id)
  - [Update Inventory Stock](#update-inventory-stock)
  - [Transfer Inventory](#transfer-inventory)
  - [Get Low Stock Items](#get-low-stock-items)
- [Integration with Existing Endpoints](#integration-with-existing-endpoints)
  - [Backward Compatibility](#backward-compatibility)
  - [Inventory Alerts](#inventory-alerts)

## Warehouses

### Get All Warehouses

Retrieves a list of all warehouses.

**URL**: `/api/warehouses`

**Method**: `GET`

**Authentication**: Required

**Query Parameters**:
- `active` (optional): Filter by active status (default: true)
- `sort` (optional): Field to sort by (default: "name")
- `order` (optional): Sort order, "asc" or "desc" (default: "asc")

**Success Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "Main Warehouse",
      "code": "MAIN",
      "address": {
        "street": "123 Main Street",
        "city": "Anytown",
        "state": "CA",
        "postalCode": "12345",
        "country": "USA"
      },
      "isActive": true,
      "isDefault": true,
      "createdAt": "2023-06-19T12:00:00.000Z",
      "updatedAt": "2023-06-19T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "Secondary Warehouse",
      "code": "SEC",
      "address": {
        "street": "456 Second Ave",
        "city": "Othertown",
        "state": "NY",
        "postalCode": "54321",
        "country": "USA"
      },
      "isActive": true,
      "isDefault": false,
      "createdAt": "2023-06-20T12:00:00.000Z",
      "updatedAt": "2023-06-20T12:00:00.000Z"
    }
  ]
}
```

### Get Warehouse by ID

Retrieves a specific warehouse by its ID.

**URL**: `/api/warehouses/:id`

**Method**: `GET`

**Authentication**: Required

**Success Response**:
```json
{
  "success": true,
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Main Warehouse",
    "code": "MAIN",
    "address": {
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "USA"
    },
    "contactPerson": "John Doe",
    "contactEmail": "john@example.com",
    "contactPhone": "555-123-4567",
    "isActive": true,
    "isDefault": true,
    "notes": "Main storage facility",
    "createdAt": "2023-06-19T12:00:00.000Z",
    "updatedAt": "2023-06-19T12:00:00.000Z"
  }
}
```

### Create Warehouse

Creates a new warehouse.

**URL**: `/api/warehouses`

**Method**: `POST`

**Authentication**: Required

**Authorization**: Admin or Manager

**Request Body**:
```json
{
  "name": "East Coast Warehouse",
  "code": "ECW",
  "address": {
    "street": "789 East Street",
    "city": "Eastville",
    "state": "VA",
    "postalCode": "23456",
    "country": "USA"
  },
  "contactPerson": "Jane Smith",
  "contactEmail": "jane@example.com",
  "contactPhone": "555-987-6543",
  "isActive": true,
  "isDefault": false,
  "notes": "New east coast distribution center"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Warehouse created successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c87",
    "name": "East Coast Warehouse",
    "code": "ECW",
    "address": {
      "street": "789 East Street",
      "city": "Eastville",
      "state": "VA",
      "postalCode": "23456",
      "country": "USA"
    },
    "contactPerson": "Jane Smith",
    "contactEmail": "jane@example.com",
    "contactPhone": "555-987-6543",
    "isActive": true,
    "isDefault": false,
    "notes": "New east coast distribution center",
    "createdAt": "2023-06-21T12:00:00.000Z",
    "updatedAt": "2023-06-21T12:00:00.000Z"
  }
}
```

### Update Warehouse

Updates an existing warehouse.

**URL**: `/api/warehouses/:id`

**Method**: `PUT`

**Authentication**: Required

**Authorization**: Admin or Manager

**Request Body**:
```json
{
  "name": "Updated Warehouse Name",
  "contactPerson": "New Contact Person",
  "contactEmail": "new@example.com"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Warehouse updated successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "Updated Warehouse Name",
    "code": "MAIN",
    "address": {
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "USA"
    },
    "contactPerson": "New Contact Person",
    "contactEmail": "new@example.com",
    "contactPhone": "555-123-4567",
    "isActive": true,
    "isDefault": true,
    "notes": "Main storage facility",
    "createdAt": "2023-06-19T12:00:00.000Z",
    "updatedAt": "2023-06-21T14:30:00.000Z"
  }
}
```

### Delete Warehouse

Soft-deletes a warehouse by marking it as inactive.

**URL**: `/api/warehouses/:id`

**Method**: `DELETE`

**Authentication**: Required

**Authorization**: Admin

**Success Response**:
```json
{
  "success": true,
  "message": "Warehouse has been deactivated",
  "data": {
    "_id": "60d21b4667d0d8992e610c86",
    "name": "Secondary Warehouse",
    "code": "SEC",
    "isActive": false,
    "isDefault": false
  }
}
```

**Error Responses**:
- Default warehouse cannot be deleted
- Warehouse with existing inventory cannot be deleted

### Get Warehouse Inventory

Retrieves inventory items in a specific warehouse.

**URL**: `/api/warehouses/:id/inventory`

**Method**: `GET`

**Authentication**: Required

**Query Parameters**:
- `lowStock` (optional): Show only low stock items (default: false)
- `sortBy` (optional): Field to sort by (default: "createdAt")
- `sortOrder` (optional): Sort order, "asc" or "desc" (default: "desc")
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 20)

**Success Response**:
```json
{
  "success": true,
  "count": 2,
  "total": 15,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "inventoryItem": {
        "_id": "60d21b4667d0d8992e610c88",
        "sku": "PROD-001",
        "name": "Product One",
        "category": "Electronics",
        "price": 99.99,
        "images": ["image1.jpg"]
      },
      "warehouse": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Main Warehouse",
        "code": "MAIN",
        "isDefault": true
      },
      "quantityOnHand": 50,
      "quantityAllocated": 5,
      "reorderPoint": 20,
      "reorderQuantity": 30,
      "preferredStockLevel": 100,
      "binLocation": "A1-B2-C3",
      "lastStockCheck": "2023-06-21T10:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c91",
      "inventoryItem": {
        "_id": "60d21b4667d0d8992e610c89",
        "sku": "PROD-002",
        "name": "Product Two",
        "category": "Furniture",
        "price": 199.99,
        "images": ["image2.jpg"]
      },
      "warehouse": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "Main Warehouse",
        "code": "MAIN",
        "isDefault": true
      },
      "quantityOnHand": 15,
      "quantityAllocated": 0,
      "reorderPoint": 10,
      "reorderQuantity": 20,
      "preferredStockLevel": 40,
      "binLocation": "D4-E5-F6",
      "lastStockCheck": "2023-06-21T10:00:00.000Z"
    }
  ]
}
```

### Get Warehouse Statistics

Retrieves statistics for a specific warehouse.

**URL**: `/api/warehouses/:id/stats`

**Method**: `GET`

**Authentication**: Required

**Success Response**:
```json
{
  "success": true,
  "data": {
    "name": "Main Warehouse",
    "code": "MAIN",
    "totalItems": 15,
    "totalStockValue": 25000.75,
    "lowStockItems": 3,
    "categoryBreakdown": [
      {
        "category": "Electronics",
        "count": 5,
        "value": 12500.50,
        "stockQuantity": 175
      },
      {
        "category": "Furniture",
        "count": 3,
        "value": 8000.25,
        "stockQuantity": 45
      },
      {
        "category": "Office Supplies",
        "count": 7,
        "value": 4500.00,
        "stockQuantity": 350
      }
    ]
  }
}
```

## Inventory Stock

### Get Inventory Stock by Item ID

Retrieves stock levels for a specific inventory item across all warehouses.

**URL**: `/api/inventory/:id/stock`

**Method**: `GET`

**Authentication**: Required

**Success Response**:
```json
{
  "success": true,
  "data": {
    "itemId": "60d21b4667d0d8992e610c88",
    "sku": "PROD-001",
    "name": "Product One",
    "totalQuantity": 120,
    "totalAllocated": 25,
    "totalAvailable": 95,
    "stockLevels": [
      {
        "_id": "60d21b4667d0d8992e610c90",
        "inventoryItem": "60d21b4667d0d8992e610c88",
        "warehouse": {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "Main Warehouse",
          "code": "MAIN",
          "isDefault": true
        },
        "quantityOnHand": 50,
        "quantityAllocated": 5,
        "reorderPoint": 20,
        "reorderQuantity": 30,
        "preferredStockLevel": 100,
        "binLocation": "A1-B2-C3",
        "lastStockCheck": "2023-06-21T10:00:00.000Z"
      },
      {
        "_id": "60d21b4667d0d8992e610c92",
        "inventoryItem": "60d21b4667d0d8992e610c88",
        "warehouse": {
          "_id": "60d21b4667d0d8992e610c86",
          "name": "Secondary Warehouse",
          "code": "SEC",
          "isDefault": false
        },
        "quantityOnHand": 70,
        "quantityAllocated": 20,
        "reorderPoint": 30,
        "reorderQuantity": 40,
        "preferredStockLevel": 120,
        "binLocation": "X1-Y2-Z3",
        "lastStockCheck": "2023-06-21T11:00:00.000Z"
      }
    ]
  }
}
```

### Update Inventory Stock

Updates stock information for a specific inventory item in a specific warehouse.

**URL**: `/api/inventory/:id/stock/:warehouseId`

**Method**: `PUT`

**Authentication**: Required

**Authorization**: Admin, Manager, or Staff

**Request Body**:
```json
{
  "quantityOnHand": 60,
  "quantityAllocated": 10,
  "reorderPoint": 25,
  "reorderQuantity": 35,
  "binLocation": "A1-B2-C4"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Inventory stock updated successfully",
  "data": {
    "id": "60d21b4667d0d8992e610c90",
    "inventoryItemId": "60d21b4667d0d8992e610c88",
    "warehouseId": "60d21b4667d0d8992e610c85",
    "quantityOnHand": 60,
    "quantityAllocated": 10,
    "availableQuantity": 50,
    "reorderPoint": 25,
    "reorderQuantity": 35,
    "binLocation": "A1-B2-C4",
    "lastStockCheck": "2023-06-22T09:30:00.000Z"
  }
}
```

### Transfer Inventory

Transfers stock between warehouses.

**URL**: `/api/inventory/:id/transfer`

**Method**: `POST`

**Authentication**: Required

**Authorization**: Admin, Manager, or Staff

**Request Body**:
```json
{
  "sourceWarehouseId": "60d21b4667d0d8992e610c85",
  "destinationWarehouseId": "60d21b4667d0d8992e610c86",
  "quantity": 15,
  "notes": "Balancing inventory between warehouses"
}
```

**Success Response**:
```json
{
  "success": true,
  "message": "Inventory transferred successfully",
  "data": {
    "inventoryItemId": "60d21b4667d0d8992e610c88",
    "sku": "PROD-001",
    "name": "Product One",
    "sourceWarehouse": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Main Warehouse",
      "code": "MAIN",
      "newQuantity": 45
    },
    "destinationWarehouse": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "Secondary Warehouse",
      "code": "SEC",
      "newQuantity": 85
    },
    "quantity": 15,
    "transferDate": "2023-06-22T10:15:00.000Z"
  }
}
```

### Get Low Stock Items

Retrieves items that are below their reorder point in any warehouse.

**URL**: `/api/inventory/low-stock/warehouse`

**Method**: `GET`

**Authentication**: Required

**Success Response**:
```json
{
  "success": true,
  "count": 2,
  "data": {
    "items": [
      {
        "item": {
          "_id": "60d21b4667d0d8992e610c88",
          "sku": "PROD-001",
          "name": "Product One",
          "category": "Electronics",
          "price": 99.99,
          "costPrice": 75.00,
          "supplier": "60d21b4667d0d8992e610c95"
        },
        "warehouses": [
          {
            "warehouse": {
              "_id": "60d21b4667d0d8992e610c85",
              "name": "Main Warehouse",
              "code": "MAIN",
              "isDefault": true
            },
            "quantityOnHand": 18,
            "quantityAllocated": 5,
            "availableQuantity": 13,
            "reorderPoint": 20,
            "reorderQuantity": 30
          }
        ],
        "totalQuantity": 88,
        "pendingOrderQuantity": 0,
        "recommendedOrderQuantity": 30
      },
      {
        "item": {
          "_id": "60d21b4667d0d8992e610c89",
          "sku": "PROD-002",
          "name": "Product Two",
          "category": "Furniture",
          "price": 199.99,
          "costPrice": 150.00,
          "supplier": "60d21b4667d0d8992e610c96"
        },
        "warehouses": [
          {
            "warehouse": {
              "_id": "60d21b4667d0d8992e610c86",
              "name": "Secondary Warehouse",
              "code": "SEC",
              "isDefault": false
            },
            "quantityOnHand": 8,
            "quantityAllocated": 3,
            "availableQuantity": 5,
            "reorderPoint": 10,
            "reorderQuantity": 20
          }
        ],
        "totalQuantity": 23,
        "pendingOrderQuantity": 20,
        "recommendedOrderQuantity": 20
      }
    ],
    "supplierGroups": {
      "60d21b4667d0d8992e610c95": [
        {
          "item": {
            "_id": "60d21b4667d0d8992e610c88",
            "sku": "PROD-001",
            "name": "Product One",
            "category": "Electronics",
            "price": 99.99,
            "costPrice": 75.00,
            "supplier": "60d21b4667d0d8992e610c95"
          },
          "warehouses": [
            {
              "warehouse": {
                "_id": "60d21b4667d0d8992e610c85",
                "name": "Main Warehouse",
                "code": "MAIN",
                "isDefault": true
              },
              "quantityOnHand": 18,
              "quantityAllocated": 5,
              "availableQuantity": 13,
              "reorderPoint": 20,
              "reorderQuantity": 30
            }
          ],
          "totalQuantity": 88,
          "pendingOrderQuantity": 0,
          "recommendedOrderQuantity": 30
        }
      ],
      "60d21b4667d0d8992e610c96": [
        {
          "item": {
            "_id": "60d21b4667d0d8992e610c89",
            "sku": "PROD-002",
            "name": "Product Two",
            "category": "Furniture",
            "price": 199.99,
            "costPrice": 150.00,
            "supplier": "60d21b4667d0d8992e610c96"
          },
          "warehouses": [
            {
              "warehouse": {
                "_id": "60d21b4667d0d8992e610c86",
                "name": "Secondary Warehouse",
                "code": "SEC",
                "isDefault": false
              },
              "quantityOnHand": 8,
              "quantityAllocated": 3,
              "availableQuantity": 5,
              "reorderPoint": 10,
              "reorderQuantity": 20
            }
          ],
          "totalQuantity": 23,
          "pendingOrderQuantity": 20,
          "recommendedOrderQuantity": 20
        }
      ]
    }
  }
}
```

## Integration with Existing Endpoints

### Backward Compatibility

The existing inventory endpoints like `/api/inventory/:id/stock` are maintained for backward compatibility but have been updated to work with the multi-warehouse structure.

When a stock update is made without specifying a warehouse, it will:

1. Try to use a warehouse ID if it's provided in the request body
2. If no warehouse ID is provided, use the default warehouse
3. If no default warehouse exists, return an error asking for a warehouse ID

### Inventory Alerts

The inventory alert system has been enhanced to include warehouse information. When stock falls below the reorder point in any warehouse, an alert will be created with the warehouse details.

Alerts with warehouse details can be retrieved using the standard alert endpoints.
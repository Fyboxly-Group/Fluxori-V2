# Fluxori-V2 API Documentation

This document provides a comprehensive reference for the Fluxori-V2 RESTful API endpoints.

## Base URL

```
https://api.fluxori.example.com/v1
```

## Authentication

All API requests require authentication using JWT (JSON Web Tokens).

### Authentication Headers

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a JWT Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

## API Endpoints

### Authentication Endpoints

#### Register a new user

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "secure_password",
  "name": "New User",
  "phone": "+1234567890" // Optional
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user456"
}
```

#### Request Password Reset

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

#### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "new_secure_password"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Inventory Management Endpoints

#### Get All Products

```http
GET /inventory/products
```

**Query Parameters**:

| Parameter   | Type    | Description                            |
|-------------|---------|----------------------------------------|
| page        | number  | Page number for pagination             |
| limit       | number  | Number of items per page               |
| sort        | string  | Field to sort by                       |
| order       | string  | Sort order (asc or desc)               |
| search      | string  | Search term for name or SKU            |
| category    | string  | Filter by category                     |
| minPrice    | number  | Minimum price filter                   |
| maxPrice    | number  | Maximum price filter                   |
| inStock     | boolean | Filter for in-stock items only         |

**Response**:

```json
{
  "data": [
    {
      "id": "prod001",
      "name": "Product Name",
      "sku": "SKU001",
      "description": "Product description",
      "price": 49.99,
      "salePrice": 39.99,
      "quantity": 100,
      "imageUrl": "https://storage.example.com/products/product001.jpg",
      "status": "ACTIVE",
      "categories": ["Electronics", "Gadgets"],
      "createdAt": "2023-01-15T12:00:00Z",
      "updatedAt": "2023-01-20T15:30:00Z"
    },
    // More products...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "limit": 10
  }
}
```

#### Get Product by ID

```http
GET /inventory/products/{productId}
```

**Response**:

```json
{
  "id": "prod001",
  "name": "Product Name",
  "sku": "SKU001",
  "description": "Product description",
  "price": 49.99,
  "salePrice": 39.99,
  "cost": 29.99,
  "quantity": 100,
  "imageUrl": "https://storage.example.com/products/product001.jpg",
  "status": "ACTIVE",
  "categories": ["Electronics", "Gadgets"],
  "tags": ["new", "featured"],
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 2,
    "unit": "in"
  },
  "weight": {
    "value": 2.5,
    "unit": "lb"
  },
  "manufacturer": "Acme Inc.",
  "lowStockThreshold": 10,
  "createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-01-20T15:30:00Z"
}
```

#### Create Product

```http
POST /inventory/products
Content-Type: application/json

{
  "name": "New Product",
  "sku": "SKU002",
  "description": "Product description",
  "price": 59.99,
  "salePrice": 49.99,
  "cost": 35.00,
  "quantity": 50,
  "imageUrl": "https://storage.example.com/products/product002.jpg",
  "status": "ACTIVE",
  "categories": ["Electronics"],
  "tags": ["new"],
  "dimensions": {
    "length": 12,
    "width": 6,
    "height": 3,
    "unit": "in"
  },
  "weight": {
    "value": 3.0,
    "unit": "lb"
  },
  "manufacturer": "Acme Inc.",
  "lowStockThreshold": 5
}
```

**Response**:

```json
{
  "id": "prod002",
  "name": "New Product",
  "sku": "SKU002",
  "description": "Product description",
  "price": 59.99,
  "salePrice": 49.99,
  "cost": 35.00,
  "quantity": 50,
  "imageUrl": "https://storage.example.com/products/product002.jpg",
  "status": "ACTIVE",
  "categories": ["Electronics"],
  "tags": ["new"],
  "dimensions": {
    "length": 12,
    "width": 6,
    "height": 3,
    "unit": "in"
  },
  "weight": {
    "value": 3.0,
    "unit": "lb"
  },
  "manufacturer": "Acme Inc.",
  "lowStockThreshold": 5,
  "createdAt": "2023-03-10T09:15:00Z",
  "updatedAt": "2023-03-10T09:15:00Z"
}
```

#### Update Product

```http
PUT /inventory/products/{productId}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 69.99,
  "quantity": 75
  // Include only fields that need to be updated
}
```

**Response**:

```json
{
  "id": "prod002",
  "name": "Updated Product Name",
  "sku": "SKU002",
  "description": "Product description",
  "price": 69.99,
  "salePrice": 49.99,
  "cost": 35.00,
  "quantity": 75,
  "imageUrl": "https://storage.example.com/products/product002.jpg",
  "status": "ACTIVE",
  "categories": ["Electronics"],
  "tags": ["new"],
  "dimensions": {
    "length": 12,
    "width": 6,
    "height": 3,
    "unit": "in"
  },
  "weight": {
    "value": 3.0,
    "unit": "lb"
  },
  "manufacturer": "Acme Inc.",
  "lowStockThreshold": 5,
  "createdAt": "2023-03-10T09:15:00Z",
  "updatedAt": "2023-03-10T10:30:00Z"
}
```

#### Delete Product

```http
DELETE /inventory/products/{productId}
```

**Response**:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### File Upload Endpoints

#### Generate Signed URL for Upload

```http
POST /storage/upload-url
Content-Type: application/json

{
  "fileName": "product_image.jpg",
  "contentType": "image/jpeg",
  "folderPath": "products"
}
```

**Response**:

```json
{
  "signedUrl": "https://storage.googleapis.com/...",
  "fileUrl": "https://storage.example.com/products/product_image.jpg",
  "expiresAt": "2023-03-10T11:00:00Z"
}
```

#### Upload File Using Signed URL

```http
PUT <signedUrl>
Content-Type: image/jpeg

[Binary file data]
```

**Note**: This request is made directly to Google Cloud Storage, not to the Fluxori API.

### Supplier Management Endpoints

#### Get All Suppliers

```http
GET /suppliers
```

**Query Parameters**:

| Parameter   | Type    | Description                            |
|-------------|---------|----------------------------------------|
| page        | number  | Page number for pagination             |
| limit       | number  | Number of items per page               |
| sort        | string  | Field to sort by                       |
| order       | string  | Sort order (asc or desc)               |
| search      | string  | Search term for name or code           |
| category    | string  | Filter by supplier category            |

**Response**:

```json
{
  "data": [
    {
      "id": "sup001",
      "name": "Acme Supplies Inc.",
      "code": "ACME001",
      "contactName": "John Smith",
      "email": "john@acmesupplies.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postalCode": "12345",
        "country": "USA"
      },
      "categories": ["Electronics", "Hardware"],
      "rating": 4.8,
      "createdAt": "2023-01-15T12:00:00Z",
      "updatedAt": "2023-02-20T15:30:00Z"
    },
    // More suppliers...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "limit": 10
  }
}
```

### Purchase Order Endpoints

#### Get All Purchase Orders

```http
GET /purchase-orders
```

**Query Parameters**:

| Parameter   | Type    | Description                            |
|-------------|---------|----------------------------------------|
| page        | number  | Page number for pagination             |
| limit       | number  | Number of items per page               |
| sort        | string  | Field to sort by                       |
| order       | string  | Sort order (asc or desc)               |
| status      | string  | Filter by order status                 |
| supplier    | string  | Filter by supplier ID                  |
| dateFrom    | string  | Start date range (ISO format)          |
| dateTo      | string  | End date range (ISO format)            |

**Response**:

```json
{
  "data": [
    {
      "id": "po001",
      "orderNumber": "PO-2023-001",
      "supplier": {
        "id": "sup001",
        "name": "Acme Supplies Inc."
      },
      "status": "DELIVERED",
      "orderDate": "2023-02-15T10:00:00Z",
      "deliveryDate": "2023-02-25T14:30:00Z",
      "totalAmount": 2499.95,
      "currency": "USD",
      "paymentTerms": "Net 30",
      "createdAt": "2023-02-15T10:00:00Z",
      "updatedAt": "2023-02-26T09:00:00Z"
    },
    // More purchase orders...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 75,
    "limit": 10
  }
}
```

### Shipment Tracking Endpoints

#### Get All Shipments

```http
GET /shipments
```

**Query Parameters**:

| Parameter   | Type    | Description                            |
|-------------|---------|----------------------------------------|
| page        | number  | Page number for pagination             |
| limit       | number  | Number of items per page               |
| sort        | string  | Field to sort by                       |
| order       | string  | Sort order (asc or desc)               |
| status      | string  | Filter by shipment status              |
| type        | string  | Filter by shipment type (inbound/outbound) |
| dateFrom    | string  | Start date range (ISO format)          |
| dateTo      | string  | End date range (ISO format)            |

**Response**:

```json
{
  "data": [
    {
      "id": "ship001",
      "trackingNumber": "1Z999AA10123456789",
      "carrier": "UPS",
      "type": "INBOUND",
      "status": "DELIVERED",
      "estimatedDelivery": "2023-02-25T00:00:00Z",
      "actualDelivery": "2023-02-24T14:35:00Z",
      "origin": {
        "name": "Acme Supplies Inc.",
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "postalCode": "12345",
          "country": "USA"
        }
      },
      "destination": {
        "name": "Fluxori Warehouse",
        "address": {
          "street": "456 Commerce Ave",
          "city": "Businesstown",
          "state": "NY",
          "postalCode": "67890",
          "country": "USA"
        }
      },
      "purchaseOrder": "po001",
      "createdAt": "2023-02-15T10:15:00Z",
      "updatedAt": "2023-02-24T14:35:00Z"
    },
    // More shipments...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 6,
    "totalItems": 55,
    "limit": 10
  }
}
```

### Alert Endpoints

#### Get All Alerts

```http
GET /alerts
```

**Query Parameters**:

| Parameter   | Type    | Description                            |
|-------------|---------|----------------------------------------|
| page        | number  | Page number for pagination             |
| limit       | number  | Number of items per page               |
| sort        | string  | Field to sort by                       |
| order       | string  | Sort order (asc or desc)               |
| type        | string  | Filter by alert type                   |
| status      | string  | Filter by alert status                 |
| priority    | string  | Filter by alert priority               |
| dateFrom    | string  | Start date range (ISO format)          |
| dateTo      | string  | End date range (ISO format)            |

**Response**:

```json
{
  "data": [
    {
      "id": "alert001",
      "type": "LOW_STOCK",
      "status": "ACTIVE",
      "priority": "HIGH",
      "message": "Product SKU001 is below low stock threshold",
      "relatedItem": {
        "type": "PRODUCT",
        "id": "prod001",
        "name": "Product Name"
      },
      "createdAt": "2023-03-01T08:30:00Z",
      "updatedAt": "2023-03-01T08:30:00Z"
    },
    // More alerts...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 27,
    "limit": 10
  }
}
```

### Report Endpoints

#### Generate Report

```http
POST /reports/generate
Content-Type: application/json

{
  "type": "INVENTORY_VALUATION",
  "format": "PDF",
  "parameters": {
    "asOfDate": "2023-03-01T00:00:00Z",
    "categories": ["Electronics", "Gadgets"],
    "includeZeroStock": false
  }
}
```

**Response**:

```json
{
  "reportId": "rep001",
  "type": "INVENTORY_VALUATION",
  "status": "PROCESSING",
  "format": "PDF",
  "createdAt": "2023-03-10T13:45:00Z"
}
```

#### Get Report Status

```http
GET /reports/{reportId}
```

**Response**:

```json
{
  "reportId": "rep001",
  "type": "INVENTORY_VALUATION",
  "status": "COMPLETED",
  "format": "PDF",
  "fileUrl": "https://storage.example.com/reports/inventory_valuation_20230301.pdf",
  "createdAt": "2023-03-10T13:45:00Z",
  "completedAt": "2023-03-10T13:47:30Z"
}
```

## Error Responses

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authentication valid, but insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate SKU)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server-side error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than zero"
      },
      {
        "field": "sku",
        "message": "SKU is required"
      }
    ]
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per user

When rate limits are exceeded, the API returns a `429 Too Many Requests` status code with headers indicating the limit and when it resets:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1615395027
```

## Webhooks

Fluxori supports webhooks for real-time event notifications:

### Available Event Types

- `inventory.updated`: Inventory item created, updated, or deleted
- `order.status_changed`: Purchase order status changed
- `shipment.status_changed`: Shipment status changed
- `alert.created`: New alert generated

### Webhook Registration

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-app.example.com/webhook-endpoint",
  "events": ["inventory.updated", "alert.created"],
  "description": "Inventory and alert webhook",
  "secret": "your_webhook_secret"
}
```

**Response**:

```json
{
  "id": "webhook001",
  "url": "https://your-app.example.com/webhook-endpoint",
  "events": ["inventory.updated", "alert.created"],
  "description": "Inventory and alert webhook",
  "status": "ACTIVE",
  "createdAt": "2023-03-10T14:30:00Z"
}
```

### Webhook Payload

When an event occurs, Fluxori sends a POST request to the registered URL with the following payload:

```json
{
  "id": "evt_123456",
  "type": "inventory.updated",
  "created": "2023-03-10T15:45:30Z",
  "data": {
    "id": "prod001",
    "name": "Product Name",
    "sku": "SKU001",
    "quantity": 75,
    "previousQuantity": 100,
    "updatedAt": "2023-03-10T15:45:00Z"
  }
}
```

Each webhook request includes a signature header for verification:

```
X-Fluxori-Signature: t=1615395330,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

## Changelog

- **2023-03-15**: Initial API documentation release
- **2023-04-02**: Added webhook documentation
- **2023-05-10**: Added report endpoints
- **2023-06-15**: Added file upload endpoints
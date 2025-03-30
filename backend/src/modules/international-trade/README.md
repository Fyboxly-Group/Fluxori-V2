# International Trade Module

This module provides comprehensive functionality for managing international shipping, customs documentation, compliance checking, and shipping rate management across multiple carriers.

## Features

- **International Shipment Management**
  - Create and track international shipments
  - Generate and manage shipping labels
  - Manage package details
  - Store origin and destination information

- **Customs Documentation**
  - Generate commercial invoices
  - Generate packing lists
  - Generate certificates of origin
  - Validate customs requirements by country

- **Compliance Checking**
  - Verify export restrictions
  - Check for prohibited and restricted items
  - Assess shipment risk
  - Verify documentation completeness

- **Multi-Carrier Support**
  - Integration with DHL
  - Integration with FedEx
  - Extendable adapter model for additional carriers
  - Rate comparison across carriers

- **Shipping Rate Management**
  - Get real-time shipping rates
  - Compare costs across carriers
  - Optimize based on cost, speed, or both
  - Support various service levels

- **Harmonized System Code Tools**
  - HS code lookup by product description
  - Trade compliance validation by HS code
  - Duty and tax calculation

## Usage Examples

### Creating an International Shipment

```typescript
// Create a shipment
const shipment = await tradeService.createShipment(
  {
    origin: {
      address: '123 Shipper St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      contactName: 'John Shipper',
      contactPhone: '555-1234',
      contactEmail: 'shipper@example.com'
    },
    destination: {
      address: '456 Receiver Ave',
      city: 'London',
      state: '',
      postalCode: 'SW1A 1AA',
      country: 'GB',
      contactName: 'Jane Receiver',
      contactPhone: '020-7946-0958',
      contactEmail: 'receiver@example.com'
    },
    packages: [
      {
        weight: 10,
        weightUnit: 'kg',
        length: 40,
        width: 30,
        height: 20,
        dimensionUnit: 'cm',
        contents: 'Electronics',
        packageType: 'box'
      }
    ],
    totalValue: 1500,
    currency: 'USD'
  },
  userId,
  organizationId
);
```

### Creating a Customs Declaration

```typescript
// Create a customs declaration for a shipment
const declaration = await tradeService.createCustomsDeclaration(
  shipmentId,
  {
    purpose: 'commercial',
    incoterm: 'DAP',
    items: [
      {
        description: 'Smartphone',
        hsCode: '851712',
        quantity: 5,
        unitValue: 300,
        totalValue: 1500,
        currency: 'USD',
        countryOfOrigin: 'US',
        weight: 2,
        weightUnit: 'kg'
      }
    ],
    declaredValue: 1500,
    currency: 'USD'
  },
  userId,
  organizationId
);
```

### Running Compliance Checks

```typescript
// Run compliance checks on a shipment
const compliance = await tradeService.runComplianceChecks(
  shipmentId,
  userId,
  organizationId
);

// Check compliance status
if (compliance.status === 'approved') {
  console.log('Shipment is compliant and ready to ship');
} else {
  console.log('Compliance issues:', compliance.checks.filter(c => c.status === 'failed'));
}
```

### Getting Shipping Rates

```typescript
// Get shipping rates
const rates = await tradeService.getShippingRates(
  shipmentId,
  userId,
  organizationId
);

// Get rates from DHL
await shippingRateService.getRatesFromProvider(rates.rateId, dhlAdapter);

// Get optimized rates
const optimizedRates = await shippingRateService.optimizeRates(
  rates.rateId, 
  'balanced' // Options: 'cost', 'speed', 'balanced'
);
```

### Booking a Shipment

```typescript
// Book a shipment with a carrier
const bookedShipment = await tradeService.bookShipment(
  shipmentId,
  rateId,
  quoteIndex,
  dhlAdapter // or fedexAdapter
);

console.log('Tracking number:', bookedShipment.trackingNumber);
```

## Architecture

The International Trade module follows a clean architecture pattern with:

1. **Models** - Data structures for shipments, customs declarations, compliance, and rates
2. **Services** - Business logic for each domain area
3. **Interfaces** - Common interface definitions for integrations
4. **Adapters** - Carrier-specific implementations
5. **Controllers** - HTTP API endpoints
6. **Routes** - API route definitions
7. **Utils** - Helper functions for HS codes and customs calculations

## Integration with Shipping Carriers

The module uses an adapter pattern to integrate with different shipping carriers. Each carrier adapter implements the `IShippingProvider` interface, which ensures consistent behavior across providers while allowing for carrier-specific implementation details.

### Adding a New Carrier

To add a new shipping carrier:

1. Create a new adapter class that extends `BaseShippingAdapter`
2. Implement the required methods in the adapter
3. Add carrier-specific configuration to `trade-providers.config.ts`
4. Update the controller to use the new adapter

## API Endpoints

The module provides the following RESTful endpoints:

- `POST /api/international-trade/shipments` - Create a shipment
- `GET /api/international-trade/shipments/:shipmentId` - Get shipment details
- `GET /api/international-trade/shipments` - List shipments with filtering
- `PUT /api/international-trade/shipments/:shipmentId` - Update a shipment
- `POST /api/international-trade/shipments/:shipmentId/customs` - Create customs declaration
- `PUT /api/international-trade/customs/:declarationId` - Update customs declaration
- `POST /api/international-trade/shipments/:shipmentId/compliance` - Run compliance checks
- `POST /api/international-trade/shipments/:shipmentId/rates` - Get shipping rates
- `POST /api/international-trade/shipments/:shipmentId/book` - Book a shipment
- `GET /api/international-trade/track/:trackingNumber` - Track a shipment
- `POST /api/international-trade/shipments/:shipmentId/cancel` - Cancel a shipment
- `POST /api/international-trade/shipments/:shipmentId/documents` - Generate customs documents
- `GET /api/international-trade/hs-codes` - Look up HS codes
- `POST /api/international-trade/duties` - Calculate duties and taxes
- `GET /api/international-trade/prohibited-items/:countryCode` - Get prohibited items
- `GET /api/international-trade/shipping-options` - Get shipping options

## Dependencies

- Mongoose for data models
- Express for API routes
- Axios for HTTP requests to carrier APIs
- UUID for generating unique identifiers
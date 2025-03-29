# Fluxori-V2 Credit System Module

This module implements the core credit system for the Fluxori-V2 platform, enabling resource-aware credit management for AI features across different subscription tiers.

## Key Features

- User/organization credit balance management
- Credit transaction history tracking
- Credit allocation based on subscription tiers (Explorer, Growth, Pro, Enterprise)
- Credit deduction for AI feature usage
- Secure API endpoints with JWT authentication

## Architecture

The module consists of the following components:

- **Models**:
  - `CreditBalance`: Stores the current credit balance for users/organizations
  - `CreditTransaction`: Records all credit transactions (allocations, purchases, usage)

- **Services**:
  - `CreditService`: Core business logic for credit operations
  
- **Controllers**:
  - `CreditController`: Handles API requests and responses

- **Routes**:
  - Credit-related API endpoints

## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/credits/balance` | GET | Get user/org credit balance | User |
| `/api/credits/history` | GET | Get transaction history | User |
| `/api/credits/initialize` | POST | Initialize credit balance | Admin |
| `/api/credits/add` | POST | Add credits | Admin |
| `/api/credits/deduct` | POST | Deduct credits for feature usage | User |
| `/api/credits/tier` | PUT | Update subscription tier | Admin |
| `/api/credits/monthly-allocation` | POST | Add monthly credit allocation | Admin |

## Usage

### Getting a User's Credit Balance

```typescript
// In a service or controller
import { CreditService } from '../modules/credits';

const balance = await CreditService.getBalance(userId);
console.log(`Current balance: ${balance.balance} credits`);
```

### Deducting Credits for Feature Usage

```typescript
// In a feature service
import { CreditService, InsufficientCreditsError } from '../modules/credits';

try {
  // Deduct 9 credits for AI insight generation
  await CreditService.deductCredits(
    userId,
    9,
    'AI Insight Generation',
    organizationId,
    insightId
  );
  
  // Proceed with feature execution
  // ...
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    // Handle insufficient credits
    return { success: false, message: 'Not enough credits for this feature' };
  }
  throw error;
}
```

## Credit Costs (Feature Integration)

These are example credit costs for AI features:

- Simple AI Insight: 9 credits
- Advanced AI Analysis: 25 credits
- AI-Generated Report: 40 credits
- Real-time AI Dashboard: 3 credits per refresh

## Subscription Tiers

| Tier | Monthly Credits | Monthly Cost | Credit Value |
|------|----------------|--------------|--------------|
| Explorer | 400 | R32-R52 | R0.08-R0.13/credit |
| Growth | 2,000 | R160-R260 | R0.08-R0.13/credit |
| Pro | 7,000 | R560-R910 | R0.08-R0.13/credit |
| Enterprise | 20,000 | R1,600-R2,600 | R0.08-R0.13/credit |

Each credit has a recovery cost of approximately R0.0183.

## Implementation Notes

- Uses MongoDB with Mongoose for data storage
- Transaction operations use MongoDB transactions for atomicity
- All API endpoints are protected with JWT authentication
- Admin-only endpoints require the 'admin' role
# Credits Feature

This feature provides a credit system for Fluxori-V2, allowing users to view their credit balance, transaction history, and purchase credit packages.

## Components

### CreditBalanceDisplay

A reusable component that displays the user's current credit balance. It can be used in various places throughout the application, such as the navbar, sidebar, or dashboard.

```tsx
<CreditBalanceDisplay size="md" showLabel={true} />
```

Props:
- `size`: Size of the display (`sm`, `md`, `lg`)
- `showLabel`: Whether to show the "Credits:" label

### CreditHistoryTable

Displays the user's credit transaction history in a paginated table. It shows the date, type, description, amount, and resulting balance for each transaction.

```tsx
<CreditHistoryTable initialLimit={10} />
```

Props:
- `initialLimit`: Initial number of items per page

### CreditPackages

Displays available credit packages for purchase. Each package is represented as a card showing the name, price, amount of credits, and a purchase button.

```tsx
<CreditPackages 
  title="Purchase Credits" 
  description="Select a credit package below to enhance your experience."
/>
```

Props:
- `title`: Section title
- `description`: Section description
- `columns`: Grid column configuration for responsive layouts

## Hooks

### useCreditBalance

```tsx
const { data: creditBalance, isLoading, isError } = useCreditBalance();
```

Returns the user's current credit balance.

### useCreditHistory

```tsx
const { data: history, isLoading, isError } = useCreditHistory({ page: 1, limit: 10 });
```

Returns a paginated list of credit transactions.

### useInfiniteCreditHistory

```tsx
const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage 
} = useInfiniteCreditHistory();
```

Returns an infinite-scrollable list of credit transactions.

### useCreditPackages

```tsx
const { data: packages, isLoading, isError } = useCreditPackages();
```

Returns the available credit packages.

### usePurchaseCreditPackage

```tsx
const { mutate: purchasePackage, isLoading } = usePurchaseCreditPackage();
```

Mutation hook for purchasing a credit package.

## API

The feature interacts with the following API endpoints:
- `GET /api/credits/balance`: Get user's credit balance
- `GET /api/credits/history`: Get credit transaction history (paginated)
- `GET /api/credits/packages`: Get available credit packages
- `POST /api/credits/purchase`: Purchase a credit package

## Integration

The feature is integrated in the following locations:
- Navbar: Credit balance display
- Sidebar mobile drawer: Credit balance display
- `/dashboard/credits` page: Full credit management UI

## Utilities

- `formatCreditAmount`: Format a credit amount with a + or - sign
- `formatCurrency`: Format a price with currency symbol
- `formatDate`: Format a date for display
- `getTransactionTypeStyles`: Get styling info for a transaction type
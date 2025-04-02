# Fluxori V2 Developer Guide

This guide is designed to help developers understand the architecture, patterns, and workflows of the Fluxori V2 frontend application.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Key Technologies](#key-technologies)
- [Coding Standards](#coding-standards)
- [Testing Approach](#testing-approach)
- [Animation System](#animation-system)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git

### Installation

1. Clone the repository
   ```bash
   git clone git@github.com:your-organization/fluxori-v2.git
   cd fluxori-v2/frontend-new
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

### Using the Storybook

Storybook is available for component development and documentation:

```bash
npm run storybook
```

Storybook will be available at http://localhost:6006

## Architecture Overview

Fluxori V2 frontend is built using Next.js with the App Router architecture. It follows a feature-based organization with a focus on code splitting, performance, and accessibility.

### Key Principles

1. **Component-First Design**: UI components are the foundation of the application.
2. **Feature-Based Organization**: Code is organized by feature rather than type.
3. **Clean Separation of Concerns**: UI, state, and business logic are kept separate.
4. **Optimized for Performance**: Code splitting, lazy loading, and performance monitoring are built-in.
5. **Accessible by Design**: Accessibility is a core requirement, not an afterthought.
6. **Motion with Purpose**: Animations are designed to enhance usability, not distract.

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **UI Library**: Mantine UI
- **Animation**: GSAP with premium plugins
- **State Management**: React Query + Zustand
- **Styling**: Emotion/CSS-in-JS via Mantine
- **Testing**: Jest, React Testing Library, Cypress

## Project Structure

The project follows a feature-based structure with a focus on organization by domain:

```
/frontend-new
├── /docs             # Documentation files
├── /public           # Static assets
├── /scripts          # Build and utility scripts
├── /src              # Application source code
│   ├── /animations   # Animation utilities and configurations
│   ├── /api          # API client and services
│   ├── /app          # Next.js app router pages and layouts
│   ├── /components   # Shared UI components
│   ├── /features     # Feature-specific components and logic
│   ├── /hooks        # Custom React hooks
│   ├── /lib          # Third-party library configurations
│   ├── /locales      # Internationalization files
│   ├── /mocks        # Mock data and services
│   ├── /store        # Global state management
│   ├── /theme        # Theme configuration
│   ├── /types        # TypeScript type definitions
│   └── /utils        # Utility functions
└── /cypress          # End-to-end tests
```

### Key Directories Explained

#### `/src/app`

Contains Next.js App Router pages and layouts. Each subdirectory represents a route in the application.

#### `/src/components`

Shared UI components that are used across multiple features. Components are organized by category or type.

#### `/src/features`

Feature-specific components and logic. Each feature directory contains everything needed for that feature:

```
/features/inventory
├── /components       # Feature-specific components
├── /hooks            # Feature-specific hooks
├── /utils            # Feature-specific utilities
└── /types            # Feature-specific types
```

#### `/src/animations`

Animation utilities and configurations for GSAP:

```
/animations
├── gsap.ts           # Basic GSAP configuration
├── enhancedGsap.ts   # Enhanced animations with premium plugins
└── optimizedGsap.ts  # Performance-optimized animations
```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code, deployed to production
- `develop`: Integration branch for features, deployed to staging
- `feature/*`: Feature development branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Maintenance tasks

### Pull Request Process

1. Create a feature branch from `develop`
2. Implement and test your changes
3. Create a pull request to merge back to `develop`
4. Ensure all CI checks pass
5. Get at least one code review
6. Squash and merge

## Key Technologies

### Next.js App Router

Next.js is the React framework used for the application, with the App Router architecture for routing and server components.

#### Key Features Used

- **App Router**: File-based routing with nested layouts
- **Route Handlers**: API endpoints
- **Server Components**: For improved performance
- **Image Optimization**: For optimized image loading
- **Font Optimization**: For optimized font loading
- **Static Site Generation**: For static pages where possible

### Mantine UI

Mantine is the UI library used for the application, providing a comprehensive set of accessible components.

#### Usage Guidelines

- Use Mantine components whenever possible
- Customize components using the theme system, not inline styles
- Use Mantine hooks for common UI patterns
- Use the responsive system for adaptive layouts

### GSAP Animation

GSAP (GreenSock Animation Platform) is used for animations, with a premium license for advanced plugins.

#### Available Plugins

- **SplitText**: Text animation
- **ScrollTrigger**: Scroll-based animations
- **DrawSVG**: SVG path animations
- **MorphSVG**: SVG shape morphing

See the [Animation Patterns](./ANIMATION-PATTERNS.md) guide for detailed usage.

### React Query

React Query is used for data fetching, caching, and state management for server state.

#### Key Concepts

- **Queries**: For fetching data
- **Mutations**: For updating data
- **Query Invalidation**: For cache invalidation
- **Prefetching**: For optimized loading

Example usage:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProduct } from '@/api/products';

function ProductList() {
  // Query for fetching data
  const { data, isLoading, error } = useQuery(['products'], fetchProducts);
  
  // QueryClient for cache management
  const queryClient = useQueryClient();
  
  // Mutation for updating data
  const mutation = useMutation(updateProduct, {
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries(['products']);
    },
  });
  
  // Rest of the component
}
```

### Zustand

Zustand is used for client state management, providing a lightweight and flexible approach.

#### Usage Guidelines

- Use Zustand for UI state that needs to be shared across components
- Keep stores small and focused
- Use selectors for optimized renders

Example usage:

```tsx
import create from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

function Sidebar() {
  // Use selector for optimized renders
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  
  // Rest of the component
}
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types whenever possible
- Use strict mode
- Create interfaces for component props
- Use type guards for narrowing types

### Component Structure

- Use functional components with hooks
- Define prop types with TypeScript interfaces
- Use default exports for components
- Keep components focused on a single responsibility

Example component structure:

```tsx
import { useState, useEffect } from 'react';
import { Card, Text, Button } from '@mantine/core';

// Define prop types
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  onAddToCart: (id: string) => void;
}

// Component implementation
export default function ProductCard({ id, name, price, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(id);
    setTimeout(() => setIsAdding(false), 1000);
  };
  
  return (
    <Card shadow="sm" p="md">
      <Text weight={500}>{name}</Text>
      <Text size="sm" color="dimmed">${price.toFixed(2)}</Text>
      <Button 
        onClick={handleAddToCart}
        loading={isAdding}
        fullWidth
        mt="md"
      >
        Add to Cart
      </Button>
    </Card>
  );
}
```

### Hooks

- Follow the Rules of Hooks
- Keep hooks focused on a single concern
- Prefix custom hooks with `use`
- Extract complex logic into custom hooks

Example custom hook:

```tsx
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

## Testing Approach

The application uses a comprehensive testing approach with different types of tests:

### Unit Tests

Unit tests focus on testing individual functions and utilities:

```tsx
// utils/formatters.test.ts
import { formatCurrency, formatDate } from '../formatters';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('handles zero amount', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```

### Component Tests

Component tests focus on testing UI components in isolation:

```tsx
// components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('displays loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests focus on testing component interactions and API integration:

```tsx
// features/inventory/components/ProductList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ProductList from '../ProductList';

// Mock server for API requests
const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('ProductList component', () => {
  it('displays products from API', async () => {
    render(<ProductList />, { wrapper });
    
    // Initially shows loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
  
  it('handles API errors', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<ProductList />, { wrapper });
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Tests

End-to-end tests focus on testing complete user flows:

```tsx
// cypress/e2e/inventory/product-management.cy.js
describe('Product Management', () => {
  beforeEach(() => {
    // Log in as admin
    cy.login('admin@example.com', 'password');
    
    // Navigate to inventory
    cy.visit('/inventory');
  });
  
  it('allows creating a new product', () => {
    // Click on New Product button
    cy.findByText('New Product').click();
    
    // Fill out form
    cy.findByLabelText('Product Name').type('Test Product');
    cy.findByLabelText('SKU').type('TEST-001');
    cy.findByLabelText('Price').type('99.99');
    cy.findByLabelText('Category').select('Electronics');
    
    // Submit form
    cy.findByText('Save Product').click();
    
    // Verify success message
    cy.findByText('Product created successfully').should('exist');
    
    // Verify product is in the list
    cy.findByText('Test Product').should('exist');
  });
  
  it('allows editing a product', () => {
    // Click on the actions menu for a product
    cy.findByText('Test Product').parent().findByRole('button', { name: /actions/i }).click();
    
    // Click Edit
    cy.findByText('Edit').click();
    
    // Update form
    cy.findByLabelText('Product Name').clear().type('Updated Product');
    
    // Submit form
    cy.findByText('Save Product').click();
    
    // Verify success message
    cy.findByText('Product updated successfully').should('exist');
    
    // Verify product is updated
    cy.findByText('Updated Product').should('exist');
  });
});
```

## Animation System

The application uses GSAP for animations, with a focus on performance and accessibility. See the [Animation Patterns](./ANIMATION-PATTERNS.md) guide for detailed information.

### Animation Principles

- **Purposeful Intelligence**: Animations should communicate meaning and provide feedback
- **Fluid Efficiency**: Animations should be smooth and performant
- **Precision & Accuracy**: Animations should be carefully calibrated

### Animation Hooks

The application provides several custom hooks for animations:

- `useAnimation`: Basic animation hook for simple effects
- `useEnhancedAnimation`: Advanced animation hook with more features
- `useAnimationOnScroll`: Hook for triggering animations on scroll
- `useStaggerAnimation`: Hook for creating staggered animations for lists
- `useMotionPreference`: Hook for respecting user motion preferences

### Motion Preference Support

The application supports three levels of motion:

1. **Minimal Motion**: For users who prefer minimal or no animations
2. **Moderate Motion**: A balanced approach with essential animations
3. **Full Motion**: Complete motion design experience

## Error Handling

The application uses a comprehensive error handling approach:

### Error Boundaries

React error boundaries are used to catch and handle errors in the component tree:

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Routes />
    </ErrorBoundary>
  );
}
```

### Global Error Handling

Global error handlers are used to catch and report unhandled errors:

```tsx
// utils/errorHandler.ts
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      // Report error to monitoring service
      reportError({
        message: event.message,
        stack: event.error?.stack,
        type: 'unhandled',
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      // Report unhandled promise rejection
      reportError({
        message: String(event.reason),
        stack: event.reason?.stack,
        type: 'unhandledPromise',
      });
    });
  }
}
```

### Error Reporting

The application includes an error reporting service:

```tsx
// utils/monitoring/errorReporting.ts
export function reportError(error, context = {}) {
  const errorData = {
    message: error.message || String(error),
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context,
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', errorData);
  }
  
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
      // Use keepalive to ensure the request completes even during page unload
      keepalive: true,
    }).catch(console.error);
  }
}
```

## Performance Optimization

The application includes several performance optimization techniques:

### Code Splitting

Code splitting is used to reduce the initial bundle size:

```tsx
// Dynamic import for component
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(() => import('@/components/dashboard/DashboardChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable server-side rendering for components with browser-only dependencies
});
```

### Lazy Loading

The application includes a custom lazy loading utility:

```tsx
// utils/lazyLoad.tsx
import { lazy, Suspense } from 'react';

interface LazyOptions {
  fallback?: React.ReactNode;
  ssr?: boolean;
  preload?: boolean;
}

export function lazyLoad(importFunc, options: LazyOptions = {}) {
  const LazyComponent = lazy(importFunc);
  
  // Preload the component if specified
  if (options.preload) {
    importFunc();
  }
  
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={options.fallback || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Usage
const Dashboard = lazyLoad(() => import('@/features/dashboard/Dashboard'), {
  fallback: <DashboardSkeleton />,
  preload: true,
});
```

### Memoization

Memoization is used to prevent unnecessary re-renders:

```tsx
import { useMemo, memo } from 'react';

// Memoize expensive calculations
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(product => product.name.includes(filter));
  }, [products, filter]);
  
  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// Memoize components that don't need to re-render
const ProductItem = memo(function ProductItem({ product, onSelect }) {
  console.log('Rendering ProductItem:', product.id);
  
  return (
    <li onClick={() => onSelect(product.id)}>
      {product.name}
    </li>
  );
});
```

### Virtual Lists

Virtual lists are used for rendering large lists efficiently:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div 
      ref={parentRef}
      style={{ height: '400px', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

Next.js Image component is used for optimizing images:

```tsx
import Image from 'next/image';

function ProductImage({ src, alt }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/png;base64,..."
      />
    </div>
  );
}
```

### Performance Monitoring

The application includes a performance monitoring service:

```tsx
// utils/monitoring/performanceMonitoring.ts
export function trackPageLoad() {
  if (typeof window === 'undefined') return;
  
  // Track Core Web Vitals
  const { getLCP, getFID, getCLS } = require('web-vitals');
  
  getLCP(metric => reportWebVital('LCP', metric));
  getFID(metric => reportWebVital('FID', metric));
  getCLS(metric => reportWebVital('CLS', metric));
  
  // Track custom metrics
  const navigationStart = performance.timing.navigationStart;
  const responseEnd = performance.timing.responseEnd;
  const domComplete = performance.timing.domComplete;
  
  const TTFB = responseEnd - navigationStart;
  const TTI = domComplete - navigationStart;
  
  reportPerformanceMetric('TTFB', TTFB);
  reportPerformanceMetric('TTI', TTI);
}

function reportWebVital(name, metric) {
  reportPerformanceMetric(name, metric.value);
}

function reportPerformanceMetric(name, value) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance metric: ${name} = ${value}`);
  }
  
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    window.gtag?.('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }
}
```

## Documentation

For more detailed information, see the following guides:

- [Component API Documentation](./COMPONENT-API.md): Detailed component API reference
- [Animation Patterns](./ANIMATION-PATTERNS.md): Animation patterns and techniques
- [Testing Guide](./TESTING.md): Comprehensive testing approach
- [Deployment Guide](../DEPLOYMENT.md): Deployment process and considerations
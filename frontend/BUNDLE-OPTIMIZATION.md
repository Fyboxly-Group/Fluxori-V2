# Bundle Optimization Guide for Fluxori-V2 Frontend

This document provides guidelines, best practices, and implementation details for optimizing bundle size and loading performance in the Fluxori-V2 frontend application.

## Table of Contents

1. [Performance Goals](#performance-goals)
2. [Code Splitting Strategies](#code-splitting-strategies)
3. [Lazy Loading Patterns](#lazy-loading-patterns)
4. [Bundle Analysis](#bundle-analysis)
5. [Common Optimization Techniques](#common-optimization-techniques)
6. [Component-Specific Optimizations](#component-specific-optimizations)
7. [Performance Monitoring](#performance-monitoring)

## Performance Goals

Our performance budget targets the following metrics:

- **Initial load time**: < 2 seconds on desktop, < 3 seconds on mobile
- **Time to interactive**: < 3 seconds on desktop, < 4 seconds on mobile
- **First contentful paint**: < 1 second
- **Total bundle size**: < 300KB initial (gzipped)
- **Largest contentful paint**: < 2.5 seconds
- **Cumulative layout shift**: < 0.1

## Code Splitting Strategies

### Route-Based Splitting

Next.js automatically code-splits at the page level. Each page becomes its own bundle, which helps reduce the initial load size.

```javascript
// This is automatically code-split by Next.js
// in /app/dashboard/page.tsx
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  return <DashboardContent />;
}
```

### Component-Based Splitting

For large components not necessary for initial render:

```javascript
import dynamic from 'next/dynamic';

// Import with Next.js dynamic
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingComponent />
});

// Or use our enhanced lazyLoad utility
import { lazyLoad } from '@/utils/lazyLoad';

const HeavyComponent = lazyLoad(() => import('@/components/HeavyComponent'), {
  priority: 'low',
  perfBudget: 1000,
  retry: true
});
```

### Feature-Based Splitting

Group related components into feature bundles:

```javascript
// All dashboard-related components in one bundle
const DashboardFeature = lazyLoad(() => import('@/features/dashboard'), {
  priority: 'high'
});
```

## Lazy Loading Patterns

### Priority-Based Loading

Our enhanced `lazyLoad` utility supports different loading priorities:

- **High**: Loads immediately upon component definition
- **Low**: Loads when the browser is idle using `requestIdleCallback`
- **Idle**: Only loaded after a longer delay during idle time

```javascript
// Critical component - load immediately
const UserProfile = lazyLoad(() => import('@/components/UserProfile'), {
  priority: 'high'
});

// Secondary component - load during idle time
const UserActivityLog = lazyLoad(() => import('@/components/UserActivityLog'), {
  priority: 'low'
});

// Non-critical component - load when very idle
const UserPreferences = lazyLoad(() => import('@/components/UserPreferences'), {
  priority: 'idle'
});
```

### Link Prefetching

Use the `useLinkPrefetch` hook for navigation elements:

```javascript
import { useLinkPrefetch } from '@/utils/lazyLoad';

function NavigationLink({ to, children }) {
  const prefetchProps = useLinkPrefetch(
    () => import(`@/app/${to}/page`),
    { delay: 150 }
  );
  
  return (
    <Link href={to} {...prefetchProps}>
      {children}
    </Link>
  );
}
```

### Retry Mechanism

Components that fail to load will automatically retry:

```javascript
const RemoteDataComponent = lazyLoad(() => import('@/components/RemoteDataComponent'), {
  retry: 3, // Will attempt to load 3 times before showing error
  fallback: <CustomLoadingSpinner />
});
```

## Bundle Analysis

### Running the Analyzer

```bash
# Generate a bundle analysis report
npm run analyze:bundle
```

The report will be saved in `reports/bundle-report-{date}.md`.

### Interpreting Results

The analysis report contains:

1. **Overall bundle size** and page-specific metrics
2. **Largest chunks** contributing to bundle size
3. **Third-party dependencies** with size breakdown
4. **Duplicate chunks** across pages
5. **Specific recommendations** for optimization

### Key Metrics to Monitor

- Initial JS bundle size (should be < 300KB gzipped)
- Largest third-party dependencies
- Pages with excessive JS payloads
- Duplicate chunks across multiple pages

## Common Optimization Techniques

### Import Optimization

```javascript
// BAD - imports entire library
import _ from 'lodash';

// GOOD - only imports what's needed
import { debounce, throttle } from 'lodash-es';
```

### Tree Shaking

Ensure your imports are ES modules and use named imports:

```javascript
// GOOD - tree-shakable
import { Button, Card } from '@mantine/core';

// BAD - imports everything
import * as Mantine from '@mantine/core';
```

### Dynamic Imports

For large libraries only used in specific cases:

```javascript
const handleChartClick = async () => {
  // Only load chart.js when needed
  const { Chart } = await import('chart.js');
  // Use Chart...
};
```

### Image Optimization

Always use Next.js Image component:

```javascript
import Image from 'next/image';

// Instead of <img>
<Image 
  src="/large-image.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

## Component-Specific Optimizations

### GSAP Optimizations

```javascript
// Direct import of only needed plugins
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register only what's needed
gsap.registerPlugin(ScrollTrigger);
```

### Mantine Optimizations

```javascript
// Import specific components instead of the entire library
import { Button } from '@mantine/core/Button';
import { Card } from '@mantine/core/Card';
```

### React-Icons Optimizations

```javascript
// BAD - imports all icons from a set
import { FaIcons } from 'react-icons/fa';

// GOOD - imports only specific icons
import { FaUser, FaHome } from 'react-icons/fa';
```

## Performance Monitoring

### Lazy Component Performance Budget

Performance budgets are set in the lazyLoad utility:

```javascript
const UserProfile = lazyLoad(() => import('@/components/UserProfile'), {
  perfBudget: 1000 // Warn if loading takes > 1000ms
});
```

### Web Vitals Tracking

All key web vitals are tracked:

```javascript
// In app/layout.tsx
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to analytics
  }
}
```

### Error Tracking

Component load failures are tracked:

```javascript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Send to error tracking service
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'error', {
      'event_category': 'component_error',
      'event_label': error.message,
      'value': 1
    });
  }
}
```

## Best Practices Checklist

- [ ] Use route-based code splitting for all pages
- [ ] Use component-based code splitting for large components
- [ ] Set appropriate loading priorities for components
- [ ] Add link prefetching for common navigation paths
- [ ] Implement retry mechanisms for network-dependent components
- [ ] Use specific imports instead of entire libraries
- [ ] Run bundle analysis before each release
- [ ] Fix large bundle issues identified in analysis
- [ ] Set performance budgets for critical components
- [ ] Track loading performance in production

## Further Resources

- [Next.js Documentation on Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [GSAP Performance Optimization](https://greensock.com/docs/v3/PerformanceOptimization)
- [Web Vitals Overview](https://web.dev/vitals/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
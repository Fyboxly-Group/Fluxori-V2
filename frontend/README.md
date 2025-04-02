# Fluxori V2 Frontend

A modern frontend for the Fluxori V2 inventory management platform, built with Next.js, Mantine UI, and GSAP animations.

## Features

- **Modern UI Framework**: Built with Mantine UI for consistent, accessible, and beautiful components
- **Professional Animations**: Powered by GSAP for smooth, performant animations and interactions
- **Scalable Architecture**: Feature-based organization for maintainable code
- **Type Safety**: Comprehensive TypeScript implementation with strict type checking
- **Responsive Design**: Mobile-first approach for all devices and screen sizes
- **Dark Mode Support**: Seamless light/dark mode toggle with user preference persistence

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
2. Navigate to the frontend directory:

```bash
cd frontend-new
```

3. Install dependencies:

```bash
npm install
```

4. Setup environment variables by creating a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Build

Create a production build:

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

### Testing

Run tests with Jest:

```bash
npm test
```

Or use the test runner script for more options:

```bash
./scripts/run-tests.sh --coverage
```

### Documentation

Run Storybook to view component documentation:

```bash
npm run storybook
```

Or use the Storybook launcher script:

```bash
./scripts/run-storybook.sh
```

Build static Storybook for deployment:

```bash
./scripts/run-storybook.sh --build
```

## Folder Structure

```
/src
  /animations   # GSAP animations and utilities
  /api          # API client and services
  /app          # Next.js App Router pages
    /docs       # Documentation pages
  /components   # Shared UI components
    /accessibility  # Accessibility components
    /__tests__      # Component tests
  /features     # Feature modules
  /hooks        # Custom React hooks
    /accessibility  # Accessibility hooks
  /locales      # Internationalization files
  /mocks        # Testing mock data and handlers
  /store        # State management
  /theme        # Mantine theme configuration
  /types        # TypeScript types and interfaces
  /utils        # Utility functions
    /accessibility  # Accessibility utilities
    /__tests__      # Utility tests
    /test-utils.tsx # Testing utilities

/.storybook     # Storybook configuration
/scripts        # Helper scripts
```

## Key Technologies

- **Next.js**: React framework with App Router
- **Mantine UI**: React component library
- **GSAP**: Professional animation library
- **React Query**: Data fetching and cache management
- **Zustand**: State management
- **Axios**: HTTP client
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: Mock Service Worker for API mocking
- **Storybook**: Component documentation and development environment

## Animation System

The animation system is built with GSAP and provides several utilities:

- Entrance/exit animations for components
- Scroll-triggered animations
- Text reveal animations
- Microinteractions for buttons and interactive elements
- Page transitions

Animation hooks make it easy to add animations to any component:

```tsx
// Example usage
const MyComponent = () => {
  const fadeInRef = useAnimatedMount('fadeInUp');
  const { ref: scrollRef, isInView } = useAnimateOnScroll();
  
  return (
    <div>
      <div ref={fadeInRef}>This fades in on mount</div>
      <div ref={scrollRef}>This animates when scrolled into view</div>
    </div>
  );
};
```

## Theme Customization

The theme is defined in `/src/theme/index.ts` and can be customized to match your brand.

## Accessibility Features

The application includes comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support with focus management and skip links
- **Screen Reader Compatibility**: ARIA attributes and live announcements for dynamic content
- **Internationalization**: Support for multiple languages with proper formatting
- **RTL Support**: Right-to-left layout support for languages like Arabic and Hebrew
- **Motion Preferences**: Respects user preferences for reduced motion
- **Accessible Components**: Pre-built components with accessibility baked in

See the detailed accessibility documentation in the app at `/docs/accessibility`.

## License

Proprietary - All rights reserved
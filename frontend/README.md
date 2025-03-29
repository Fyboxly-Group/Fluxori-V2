# Fluxori V2 Frontend

A modern SaaS platform built with Next.js and Chakra UI v3.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15+
- **UI Library**: [Chakra UI v3](https://chakra-ui.com/)
- **State Management**: React Context API
- **Authentication**: Custom auth with JWT
- **Language**: TypeScript
- **Styling**: Emotion (via Chakra UI)
- **Internationalization**: Custom i18n implementation

## Getting Started

### Prerequisites

- Node.js 18.17.0 or newer
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/fluxori-v2.git
   cd fluxori-v2/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run analyze` - Analyze the bundle size
- `npm run format` - Format code with Prettier
- `npm run validate` - Run linting and type checking
- `npm run build:production` - Build for production with validation
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
frontend/
├── .env.example             # Example environment variables
├── .env.development         # Development environment variables
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
├── public/                  # Static assets
├── src/
│   ├── api/                 # API integration
│   │   ├── client.ts        # API client
│   │   └── auth.ts          # Auth service
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth routes
│   │   ├── (dashboard)/     # Dashboard routes
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── providers.tsx    # App providers
│   ├── components/          # Reusable components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── config/              # App configuration
│   ├── context/             # React Context
│   │   └── AuthContext.tsx  # Auth context
│   ├── i18n/                # Internationalization
│   │   ├── index.ts         # i18n configuration
│   │   └── locales/         # Translation files
│   ├── theme/               # Chakra UI theme
│   │   └── index.ts         # Theme configuration
│   └── utils/               # Utility functions
└── CHAKRA-UI-V3-PATTERNS.md # Best practices for Chakra UI v3
```

## Chakra UI v3 Best Practices

The project follows best practices for Chakra UI v3 as documented in [CHAKRA-UI-V3-PATTERNS.md](./CHAKRA-UI-V3-PATTERNS.md), including:

- Direct imports for better tree-shaking
- Modern prop naming (e.g., `loading` instead of `isLoading`)
- Using `gap` prop instead of `spacing`
- Using `useColorMode` with ternary expressions
- Using `createToaster` instead of `useToast`

## Environment Variables

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_AUTH_ENABLED` - Enable/disable authentication

See `.env.example` for all available environment variables.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
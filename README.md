# Fluxori-V2

Fluxori-V2 is an enterprise inventory and supply chain management platform, providing comprehensive tools for inventory management, supplier coordination, purchase order workflows, shipment tracking, and advanced reporting.

## Project Status

See [FEATURES.md](FEATURES.md) for the current implementation status.

## Documentation

### User Documentation

- [End-User Guide](docs/user-guides/end-user-guide.md) - Comprehensive guide for day-to-day users
- [Feature Walkthroughs](docs/user-guides/feature-walkthroughs.md) - Step-by-step instructions for specific tasks
- [Administrator Guide](docs/user-guides/admin-guide.md) - Guide for system administrators

### Developer Documentation

- [Developer Guide](docs/developer-guide.md) - Guide for developers working on the platform
- [API Documentation](docs/api-documentation.md) - API reference for integration
- [Architecture Overview](docs/architecture.md) - Technical architecture documentation
- [Testing Strategy](docs/testing-strategy.md) - Testing approach and guidelines

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local development)
- Google Cloud SDK (for deployment)

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/fluxori-v2.git
   cd fluxori-v2
   ```

2. Setup environment variables:
   ```
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Install dependencies:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. Start the development servers:
   ```
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

For more detailed instructions, refer to the [Developer Guide](docs/developer-guide.md).

## License

Copyright © 2025 Your Company Name. All rights reserved.
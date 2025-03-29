# Fluxori-V2 Developer Guide

This guide provides developers with information on setting up, developing, and deploying the Fluxori-V2 application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Development Guidelines](#development-guidelines)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Project Overview

Fluxori-V2 is an enterprise inventory and supply chain management platform built with modern web technologies. It consists of a Next.js frontend application and a Node.js backend API, with infrastructure deployed on Google Cloud Platform.

### Key Features

- Inventory Management
- Supplier Management
- Purchase Order Management
- Shipment Tracking
- Alert System
- Reporting & Analytics
- File Storage & Management

### Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Chakra UI v3
- **Backend**: Node.js, Express, TypeScript
- **Database**: Google Firestore/MongoDB
- **Storage**: Google Cloud Storage
- **Infrastructure**: Google Cloud Platform, Terraform
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Google Cloud SDK
- Terraform 1.5+
- Git

### Development Environment Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-organization/fluxori-v2.git
cd fluxori-v2
```

2. **Set up environment variables**

Create `.env.local` files in both the frontend and backend directories:

**Backend .env**:
```
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/fluxori
JWT_SECRET=your_jwt_secret
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
STORAGE_BUCKET=your-project-id-files-dev
CORS_ORIGIN=http://localhost:3000
```

**Frontend .env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENVIRONMENT=development
```

3. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

4. **Start development servers**

```bash
# Start backend server
cd backend
npm run dev

# In a separate terminal, start frontend server
cd frontend
npm run dev
```

5. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Running with Docker

You can also use Docker Compose to run the entire stack:

```bash
docker-compose up
```

This will start the frontend, backend, and MongoDB in separate containers.

## Architecture

Fluxori-V2 follows a modern microservices architecture. See `architecture.md` for a detailed overview of the system architecture.

### Project Structure

```
fluxori-v2/
├── frontend/             # Next.js application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and constants
│   │   ├── services/     # API service layer
│   │   └── styles/       # Global styles
│   ├── next.config.js    # Next.js configuration
│   └── package.json      # Frontend dependencies
│
├── backend/              # Node.js API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # API controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── server.ts         # Server entry point
│   └── package.json      # Backend dependencies
│
├── docs/                 # Documentation
├── infrastructure/       # Terraform configuration
└── docker-compose.yml    # Docker Compose configuration
```

## Development Guidelines

### Coding Standards

- **TypeScript**: Use strong typing for all files. Avoid `any` types when possible.
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Component Structure**: Follow the Atomic Design methodology for component organization

### Git Workflow

1. **Branch Naming**:
   - Feature branches: `feature/description`
   - Bug fixes: `fix/description`
   - Documentation: `docs/description`
   - Refactoring: `refactor/description`

2. **Commit Messages**:
   Follow conventional commits:
   - `feat: Description of new feature`
   - `fix: Description of bug fix`
   - `docs: Documentation updates`
   - `refactor: Code refactoring`
   - `test: Adding tests`
   - `chore: Maintenance tasks`

3. **Pull Requests**:
   - Create a PR with a clear description of changes
   - Link to any related issues
   - Ensure tests pass before requesting review
   - Require at least one reviewer approval

### State Management

- Use **React Context** for global UI state
- Use **Zustand** for complex application state
- Use **React Query** for server state management
- Follow this hierarchy when deciding where to store state:
  1. Component state (useState)
  2. Component context
  3. Zustand store
  4. React Query cache

### API Integration

- Use the `api.ts` service for all backend requests
- Structure:
  ```
  src/services/api/
  ├── api.ts              # Base API client
  ├── endpoints.ts        # API endpoint definitions
  ├── interceptors.ts     # Request/response interceptors
  └── modules/            # API modules by domain
      ├── auth.ts
      ├── inventory.ts
      ├── suppliers.ts
      ├── orders.ts
      └── ...
  ```

## Testing

### Frontend Testing

The frontend uses Jest and React Testing Library for tests:

```bash
# Run frontend tests
cd frontend
npm test

# Run tests with coverage
npm test -- --coverage
```

#### Test Structure

- `__tests__/` directories for test files
- `.test.tsx` or `.spec.tsx` suffix for test files
- Mock external dependencies using Jest mocks

### Backend Testing

The backend uses Jest and Supertest for API testing:

```bash
# Run backend tests
cd backend
npm test

# Run tests with coverage
npm test -- --coverage
```

### CI Testing

The CI pipeline automatically runs tests on pull requests. Tests must pass before merging is allowed.

## Deployment

### Environment Configuration

Fluxori-V2 supports three environments:
- Development (dev)
- Staging
- Production (prod)

### Infrastructure Deployment

Infrastructure is managed using Terraform:

```bash
# Initialize Terraform
cd infrastructure/terraform/environments/dev
terraform init

# Plan the deployment
terraform plan -var-file=dev.tfvars -out=tfplan

# Apply the changes
terraform apply tfplan
```

### Application Deployment

The CI/CD pipeline automatically deploys changes to the appropriate environment based on the branch:
- `dev` branch deploys to the development environment
- `main` branch deploys to the production environment

Manual deployment:

```bash
# Build and push backend
cd backend
docker build -t gcr.io/$PROJECT_ID/fluxori-backend:$TAG .
docker push gcr.io/$PROJECT_ID/fluxori-backend:$TAG

# Build and push frontend
cd frontend
docker build -t gcr.io/$PROJECT_ID/fluxori-frontend:$TAG .
docker push gcr.io/$PROJECT_ID/fluxori-frontend:$TAG
```

### Database Migrations

Database migrations are managed using a custom migration script:

```bash
cd backend
npm run migrate
```

## Troubleshooting

### Common Issues

#### Authentication Problems

If you're having issues with authentication:
- Check if your JWT token is expired
- Verify the JWT_SECRET in your environment variables
- Check if the user exists in the database

#### Google Cloud Storage

If file uploads are failing:
- Verify your GOOGLE_APPLICATION_CREDENTIALS path
- Ensure the service account has proper permissions
- Check if the storage bucket exists

#### Development Server

If the development server won't start:
- Check if the port is already in use
- Verify all dependencies are installed
- Check for TypeScript errors
- Ensure environment variables are properly set

### Logging

- Development logs are output to the console
- Production logs are sent to Google Cloud Logging
- Use the following log levels appropriately:
  - `error`: For errors that need immediate attention
  - `warn`: For non-critical issues
  - `info`: For general operational information
  - `debug`: For detailed debugging information

### Getting Help

If you need help, you can:
- Check the existing documentation
- Search for issues in the GitHub repository
- Ask in the team Slack channel
- Create a new GitHub issue

## Additional Resources

- [API Documentation](./api-documentation.md)
- [Architecture Overview](./architecture.md)
- [User Guides](./user-guides/index.md)
  - [End-User Guide](./user-guides/end-user-guide.md)
  - [Feature Walkthroughs](./user-guides/feature-walkthroughs.md)
  - [Administrator Guide](./user-guides/admin-guide.md)
- [Deployment Guide](./deployment-guide.md)
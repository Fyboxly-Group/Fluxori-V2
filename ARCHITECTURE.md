# Fluxori-V2 Architecture

This document outlines the architecture of the Fluxori-V2 system, including its components, data flow, and design patterns.

## System Overview

Fluxori-V2 is an inventory management system built with modern web technologies. It provides real-time inventory tracking, shipment management, alerting, and reporting features for businesses.

## Tech Stack

### Frontend
- **React**: UI library for building component-based interfaces
- **TypeScript**: Typed JavaScript for increased maintainability
- **Zustand**: State management library
- **React Query**: Data fetching and caching
- **Material-UI**: Component library for consistent design
- **Vite**: Build tool for fast development

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe code
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication mechanism
- **Swagger/OpenAPI**: API documentation

### Infrastructure
- **Google Cloud Platform (GCP)**: Cloud hosting
  - **Cloud Run**: Containerized application deployment
  - **Firestore**: Database service
  - **Secret Manager**: Secure secrets storage
  - **Cloud Storage**: File and image storage
- **Terraform**: Infrastructure as Code
- **GitHub Actions**: CI/CD pipelines

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Frontend     │◄────►│  Backend API    │◄────►│   Database      │
│    (React)      │      │  (Express)      │      │   (MongoDB)     │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │                 │
                         │  Cloud Storage  │
                         │                 │
                         └─────────────────┘
```

## Component Architecture

### Frontend Architecture

The frontend follows a component-based architecture with the following structure:

1. **Pages**: Top-level components representing entire screens
2. **Components**: Reusable UI elements
3. **Hooks**: Custom React hooks for shared logic
4. **Services**: API client functions
5. **Store**: Zustand state management

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── common/      # Common UI components
│   ├── inventory/   # Inventory-specific components
│   ├── shipment/    # Shipment-specific components
│   └── ...
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API client services
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Backend Architecture

The backend follows a modular, layered architecture:

1. **Routes**: Define API endpoints and HTTP methods
2. **Controllers**: Handle HTTP requests and responses
3. **Services**: Implement business logic
4. **Models**: Define data schemas and database interactions
5. **Middleware**: Handle cross-cutting concerns (auth, error handling)

```
src/
├── config/          # Configuration settings
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic
├── tests/           # Test files
└── utils/           # Utility functions
```

## Data Flow

1. **Client Request**: The frontend sends HTTP requests to the backend API
2. **Authentication**: JWT middleware validates the user's token
3. **Routing**: Express routes direct the request to the appropriate controller
4. **Controller**: The controller processes the request and invokes service methods
5. **Service**: Business logic is applied, including data validation
6. **Model**: Database operations are performed via Mongoose models
7. **Response**: The controller formats and returns the response to the client

## Design Patterns

### Repository Pattern

The system uses Mongoose models as repositories to abstract database operations.

### Service Layer Pattern

Business logic is encapsulated in service classes, separating it from controllers.

### MVC Pattern (Modified)

The backend follows a modified MVC pattern where:
- Models: Mongoose schemas
- Views: Not applicable (API returns JSON)
- Controllers: Express route handlers

### Observer Pattern

The alert system implements an observer pattern for notifications when inventory levels change.

## Authentication Flow

1. User submits login credentials (email/password)
2. Backend validates credentials against stored user data
3. If valid, a JWT token is generated and returned
4. Frontend stores token in local storage or cookie
5. Subsequent requests include the token in Authorization header
6. Backend middleware validates token for protected routes

## Scalability Considerations

- **Horizontal Scaling**: Cloud Run instances automatically scale based on traffic
- **Database Indexing**: Mongoose schemas include indexes for frequently queried fields
- **Caching**: React Query provides client-side caching for API responses
- **Pagination**: API endpoints support pagination for large data sets

## Security Measures

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation of all input data
- **HTTPS**: All communications encrypted in transit
- **Secret Management**: GCP Secret Manager for sensitive configuration
- **Content Security Policy**: Headers to prevent XSS attacks

## Testing Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and service interactions
- **End-to-End Tests**: Complete user workflows
- **Automated Testing**: Tests run on each commit via GitHub Actions

## Deployment Pipeline

1. Developer commits code to GitHub repository
2. GitHub Actions triggered to run tests and linting
3. If tests pass, build Docker containers
4. Push containers to Google Container Registry
5. Deploy to Cloud Run staging environment
6. Run integration tests against staging
7. If approved, promote to production environment

## Monitoring and Logging

- **Application Logs**: Structured logging sent to Cloud Logging
- **Performance Metrics**: Cloud Monitoring for application performance
- **Alerts**: Automated alerts for system issues
- **Error Tracking**: Detailed error tracking with stack traces
- **Usage Analytics**: Track feature usage and user behavior
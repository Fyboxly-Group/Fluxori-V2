# Fluxori-V2 Architecture

## System Architecture Overview

Fluxori-V2 follows a modern microservices architecture deployed on Google Cloud Platform with the following key components:

### Frontend Architecture

The frontend is a Next.js 15 application with React 19, featuring:

- **App Router**: Utilizes Next.js 15's app router for server components and routing
- **Component Architecture**: Following Atomic Design methodology
- **State Management**: Combination of React Context, Zustand, and React Query
- **Authentication**: Client-side authentication with JWT tokens
- **API Integration**: Centralized API client with request/response interceptors
- **Performance Optimization**: Server components, lazy loading, and code splitting

### Backend Architecture

The backend follows a modular architecture with:

- **API Layer**: Express/NestJS REST API with versioning
- **Service Layer**: Business logic encapsulation
- **Data Access Layer**: Repository pattern for database operations
- **Authentication/Authorization**: JWT-based authentication with role-based access control
- **Validation**: Input validation using middleware
- **Error Handling**: Centralized error handling with proper HTTP responses

### Data Architecture

- **Database**: Google Cloud SQL/Firestore for structured data
- **File Storage**: Google Cloud Storage for media and documents
- **Caching**: Redis for caching frequently accessed data
- **Search**: Google Cloud Search API for full-text search capabilities

### Infrastructure Architecture

Deployed on Google Cloud Platform with:

- **Compute**: Google Cloud Run for containerized services
- **Networking**: Cloud Load Balancing for traffic distribution
- **CI/CD**: GitHub Actions for continuous integration and deployment
- **Monitoring**: Google Cloud Monitoring and Logging
- **Security**: Secret Manager for credentials, IAM for access control

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browsers                       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloud Load Balancing                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js Application)               │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ React Router │  │ UI Components │  │  State Management │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │  API Client  │  │   Utilities   │  │     Analytics    │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend API Services                   │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │   Routes     │  │  Controllers  │  │     Services     │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Middlewares  │  │    Models     │  │     Utilities    │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  │
└───┬───────────────────────┬───────────────────────┬─────────┘
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────────┐      ┌─────────────┐         ┌─────────────┐
│  Database   │      │  Cloud      │         │  External   │
│  (Cloud SQL)│      │  Storage    │         │    APIs     │
└─────────────┘      └─────────────┘         └─────────────┘
```

## Data Flow

1. **Authentication Flow**
   - User credentials → Frontend → Backend API → JWT generation → Frontend storage
   
2. **Data Retrieval Flow**
   - Frontend request → API Gateway → Backend service → Database → Response formatting → Frontend

3. **File Upload Flow**
   - Frontend upload → Backend validation → Cloud Storage → URL generation → Database reference

## Security Architecture

- **Authentication**: JWT tokens with proper expiration and refresh mechanisms
- **Authorization**: Role-based access control with permission checking
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Sanitization at API boundaries
- **CORS Configuration**: Properly restricted cross-origin requests
- **Rate Limiting**: Protection against DDoS and brute force attacks

## Deployment Architecture

- **Continuous Integration**: Automated testing on pull requests
- **Continuous Deployment**: Automated deployment to staging and production
- **Environment Separation**: Development, staging, and production environments
- **Infrastructure as Code**: Terraform configuration for GCP resources
- **Secrets Management**: Google Secret Manager with controlled access

## Monitoring & Observability

- **Logging**: Structured logging with correlation IDs
- **Monitoring**: Real-time performance metrics
- **Alerting**: Automated alerts for service degradation
- **Error Tracking**: Detailed error reporting with context
- **Performance Analysis**: Regular performance reviews and optimizations
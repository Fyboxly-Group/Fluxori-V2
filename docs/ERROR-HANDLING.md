# Comprehensive Error Handling - Fluxori-V2

This document describes the error handling system implemented in Fluxori-V2 to provide robust and consistent error management across the application.

## Overview

The error handling system in Fluxori-V2 addresses several key aspects:

1. **Error Classification**: Categorizes errors by type and severity
2. **Standardized Error Format**: Provides consistent error objects with detailed metadata
3. **Advanced Retry Logic**: Implements exponential backoff and recovery for transient issues
4. **User-Friendly Messages**: Translates technical errors into actionable user messages
5. **Centralized Logging**: Captures detailed error information for debugging and monitoring
6. **Error Monitoring**: Tracks error patterns and alerts on critical issues
7. **Graceful UI Degradation**: Handles errors at the component level with fallback states

## Key Components

### Backend Error System

The backend utilizes a hierarchical error system with the following components:

#### Base Error Class

`AppError` serves as the foundation of the error system, extending the standard `Error` class with additional properties:

- `statusCode`: HTTP status code to return to the client
- `category`: Error classification (e.g., network, database, marketplace)
- `severity`: Error severity level (critical, error, warning, info)
- `code`: Machine-readable error code for programmatic handling
- `context`: Additional contextual information for debugging
- `retryable`: Whether the operation can be retried
- `retryAfter`: Suggested retry delay for rate limiting
- `validationErrors`: Field-specific validation errors
- `suggestion`: User-friendly suggestion for resolution

#### Specialized Error Types

Built on the `AppError` foundation, specialized error classes handle specific error scenarios:

- `NetworkError`: For connectivity issues
- `DatabaseError`: For database operation failures
- `ValidationError`: For input validation failures
- `AuthenticationError`: For authentication failures
- `AuthorizationError`: For permission issues
- `ResourceNotFoundError`: For missing resources
- `ApiLimitError`: For rate limiting scenarios
- `MarketplaceError`: For external marketplace issues
- `BusinessError`: For business logic violations
- `ConflictError`: For resource conflicts

#### Marketplace-Specific Errors

`MarketplaceApiError` extends the base error system for marketplace integrations, adding:

- Marketplace-specific error codes
- Rate limiting detection and handling
- Authentication and credential validation
- Integration with marketplace adapter retry logic

#### Error Middleware

Express middleware components for centralized error handling:

- `requestIdMiddleware`: Adds request ID for tracing
- `requestLogger`: Logs request details for context
- `errorHandler`: Processes errors into standardized responses
- `errorMetricsMiddleware`: Collects error metrics for monitoring

### Frontend Error System

The frontend implements a comprehensive error handling approach:

#### Error Utilities

- `parseApiError`: Transforms API errors into standardized format
- `getFriendlyErrorMessage`: Creates user-friendly messages from technical errors
- `getErrorSuggestion`: Provides actionable resolution steps
- `shouldReportError`: Determines if error should be reported to monitoring

#### API Error Handling

Enhanced API client with:

- Automatic retry logic with exponential backoff
- Request queueing and rate limiting
- Authentication token management
- Standardized error transformation

#### React Query Integration

Configuration for React Query with enhanced error handling:

- Automatic retries for transient errors
- Error transformation and categorization
- Selective error reporting to monitoring
- Toast notifications for user feedback

#### UI Components

- `ErrorBoundary`: Catches and handles React component errors
- `ErrorDisplay`: Reusable error presentation component
- `QueryStateHandler`: Handles loading, error, and success states

#### Error Monitoring

Dashboard for tracking and analyzing error patterns:

- Error trend visualization
- Filtering by category, time period, and severity
- Detailed error inspection

## Error Categories

Errors are classified into the following categories:

| Category | Description | Examples |
|----------|-------------|----------|
| `NETWORK` | Network connectivity issues | Connection timeouts, DNS failures |
| `DATABASE` | Database operation failures | Query errors, connection issues |
| `INTERNAL` | Internal server errors | Unhandled exceptions, system failures |
| `VALIDATION` | Input validation failures | Invalid form data, malformed requests |
| `AUTHENTICATION` | Authentication failures | Invalid credentials, expired tokens |
| `AUTHORIZATION` | Permission issues | Insufficient permissions, forbidden actions |
| `API_LIMIT` | Rate limiting or quota errors | Too many requests, quota exceeded |
| `INTEGRATION` | External service issues | API failures, service unavailability |
| `MARKETPLACE` | Marketplace-specific errors | Listing failures, order processing |
| `BUSINESS` | Business logic violations | Insufficient inventory, business rule violations |
| `RESOURCE` | Resource not found | 404 errors, missing records |
| `CONFLICT` | Resource conflicts | Duplicate entries, concurrent modification |
| `CLIENT` | General client errors | Invalid requests, browser issues |
| `REQUEST` | Invalid request errors | Bad request format, unsupported methods |
| `UI` | UI-specific errors | Rendering issues, component failures |
| `UNEXPECTED` | Unclassified errors | Unforeseen issues not matching other categories |

## Error Severity Levels

Errors are assigned severity levels:

- **CRITICAL**: System unusable, requires immediate attention
- **ERROR**: Functionality broken, requires attention
- **WARNING**: Potential issues that don't break functionality
- **INFO**: Informational errors that don't affect functionality

## Retry Strategy

The system implements a sophisticated retry strategy:

1. **Automatic Classification**: Errors are automatically assessed for retry eligibility
2. **Exponential Backoff**: Increasing delay between retry attempts
3. **Jitter**: Random delay variation to prevent thundering herd problems
4. **Retry-After Respect**: Honor service-provided retry delays
5. **Maximum Attempts**: Configure maximum retry attempts by error type
6. **Idempotency Awareness**: Special handling for non-idempotent operations

## Error Response Format

Standardized error responses include:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "category": "error_category",
  "errors": {
    "fieldName": ["Validation error message"]
  },
  "suggestion": "Try this to resolve the issue",
  "retryable": true,
  "retryAfter": 30000,
  "trackingId": "req-123456"
}
```

## Integration Points

The error handling system integrates with:

- **Logging**: Structured logs with contextual information
- **Monitoring**: Error metrics and alerting
- **Notification System**: User notifications for important errors
- **Status Dashboard**: System status visualization

## Usage Examples

### Backend Error Handling

```typescript
try {
  // Operation that might fail
  await someOperation();
} catch (error) {
  // Convert to AppError with appropriate category and context
  throw new MarketplaceApiError(
    'amazon', 
    'Failed to process order', 
    MarketplaceErrorCode.ORDER_PROCESSING_FAILED,
    500,
    {
      context: { orderId: '12345' },
      suggestion: 'Please try again or contact support'
    },
    error
  );
}
```

### Frontend Error Handling with React Query

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  // Enhanced error handling
  ...enhanceQueryOptions({
    retry: 3,
    meta: {
      showErrorToast: true
    }
  })
});

// Use the QueryStateHandler for consistent loading/error states
return (
  <QueryStateHandler
    isLoading={isLoading}
    isError={!!error}
    error={error}
    onRetry={() => refetch()}
  >
    {data && <DataDisplay data={data} />}
  </QueryStateHandler>
);
```

## Best Practices

1. **Use Specific Error Types**: Choose the most specific error class for the situation
2. **Include Context**: Add relevant context information to aid debugging
3. **User-Friendly Messages**: Provide clear, actionable error messages for users
4. **Consistent Error Codes**: Use well-defined error codes for programmatic handling
5. **Proper Status Codes**: Use appropriate HTTP status codes in API responses
6. **Validate Inputs Early**: Catch validation errors before processing begins
7. **Fail Fast**: Fail quickly on non-recoverable errors
8. **Graceful Degradation**: Provide fallback UI when errors occur
9. **Log Appropriately**: Include enough information for debugging
10. **Security Awareness**: Don't expose sensitive information in error responses

## Error Monitoring and Alerting

The system includes an error monitoring dashboard at `/admin/monitoring/errors` that provides:

- Real-time error tracking and visualization
- Error trend analysis over time 
- Filtering by category, severity, and time period
- Detailed error inspection and debugging
- CSV export for offline analysis

Critical errors trigger alerts via:
- Email notifications to system administrators
- Slack/Teams notifications to development team
- SMS alerts for critical production issues

## Future Enhancements

Planned improvements to the error handling system:

1. Integration with external error monitoring services
2. Machine learning-based error pattern detection
3. Enhanced correlation between related errors
4. Error impact assessment based on business metrics
5. Self-healing mechanisms for common error patterns
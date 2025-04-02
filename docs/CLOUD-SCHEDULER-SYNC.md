# Marketplace Sync Cloud Scheduler Implementation

This document describes the implementation of GCP Cloud Scheduler for marketplace synchronization in Fluxori-V2.

## Overview

The marketplace sync functionality has been migrated from using `setInterval` to GCP Cloud Scheduler for better reliability, monitoring, and configurability. This change enables more robust scheduling, detailed logging, and proper authentication between services.

## Architecture

The implementation follows this architecture:

1. **Cloud Scheduler Job**: A GCP Cloud Scheduler job configured in Terraform that triggers at defined intervals
2. **Secured Endpoint**: A dedicated Cloud Run endpoint that receives and validates scheduler requests
3. **Authentication**: OIDC-based authentication between Cloud Scheduler and the API endpoint
4. **Orchestration Service**: The existing sync orchestrator service enhanced to support scheduler invocation

## Components

### Cloud Scheduler

The Cloud Scheduler job is defined in Terraform with these key properties:

- Configurable schedule using CRON syntax (default: every 15 minutes)
- Retry configuration for handling transient failures
- OIDC-based authentication for secure invocation
- Custom headers for additional authentication

### API Endpoint

A dedicated API endpoint for the scheduler:

- Path: `/api/sync/scheduler`
- Method: POST
- Authentication: Validates the request based on OIDC identity and/or custom headers
- No admin authentication required (uses scheduler-specific authentication)

### Sync Orchestrator Service

The `SyncOrchestratorService` has been enhanced to:

- Validate incoming scheduler requests
- Maintain compatibility with existing manual triggers
- Provide improved logging for scheduler-initiated operations
- Handle results properly for asynchronous operations

## Authentication Flow

1. Cloud Scheduler makes a request to the sync endpoint with:
   - OIDC identity token in the Authorization header
   - Custom `x-scheduler-secret` header as a fallback

2. The API endpoint validates:
   - OIDC token issuer and audience
   - Secret token matching the configured value

3. If validation succeeds, the sync process is triggered

## Configuration

### Terraform Configuration

- **Module**: `marketplace_sync_scheduler`
- **Key Parameters**:
  - `schedule_cron`: CRON expression for scheduling (default: "*/15 * * * *")
  - `service_account_email`: Service account for authentication
  - `sync_endpoint_url`: URL of the sync endpoint
  - `retry_config`: Retry configuration for handling failures

### Environment Variables

- `SCHEDULER_SECRET`: Secret token for additional authentication

## Deployment

To deploy the Cloud Scheduler implementation:

1. Ensure appropriate variables are set in your environment:
   ```
   export TF_VAR_scheduler_secret="your-secure-random-string"
   ```

2. Apply the Terraform configuration:
   ```
   cd infrastructure/terraform/environments/dev
   terraform apply
   ```

3. Verify the scheduler job is created:
   ```
   gcloud scheduler jobs list --project=your-project-id
   ```

## Monitoring and Logging

- Scheduler job executions are logged in Cloud Logging
- Application logs include scheduler-specific identifiers
- The sync status API endpoint (`/api/sync/status`) provides information about sync operations

## Error Handling

The implementation includes robust error handling:

- Retries for transient failures
- Detailed error logging
- Immediate 202 Accepted response to Cloud Scheduler to prevent unnecessary retries
- Background processing of sync operations to avoid timeouts

## Development and Testing

For local development:

1. The system maintains backward compatibility with the setInterval approach
2. Set `SKIP_SCHEDULER_AUTH=true` in development environment to bypass authentication checks
3. Use the `/api/sync/scheduler` endpoint directly with appropriate headers for testing

## Security Considerations

- Cloud Scheduler uses a dedicated service account with minimal permissions
- OIDC authentication validates the identity of the scheduler
- Additional secret token provides defense in depth
- All secrets are stored and accessed securely through Secret Manager
- The scheduler endpoint is not protected by admin authentication to enable scheduler access

## Additional Resources

- [GCP Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [Cloud Run Authentication](https://cloud.google.com/run/docs/authenticating/service-to-service)
- [Terraform Cloud Scheduler Resources](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_scheduler_job)
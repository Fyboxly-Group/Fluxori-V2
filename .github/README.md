# Fluxori-V2 GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and continuous deployment (CI/CD) of the Fluxori-V2 application.

## Workflows

- `backend-cicd.yml`: CI/CD pipeline for the backend service

## Required Secrets

The following GitHub repository secrets are required for the workflows to function properly:

| Secret Name | Description |
|-------------|-------------|
| `GCP_PROJECT_ID` | Google Cloud Platform project ID |
| `GCP_ARTIFACT_REGISTRY` | Name of the Artifact Registry repository |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | GCP Workload Identity Provider URL (preferred auth method) |
| `GCP_SERVICE_ACCOUNT` | Email of the GCP service account used for deployment |
| `SLACK_WEBHOOK_URL` | Webhook URL for Slack notifications |

## Environment Configuration

The workflow uses different Cloud Run service names based on the deployment environment:

- **Development**: `fluxori-backend-dev` (deployed on push to `main` branch)
- **Staging**: `fluxori-backend-staging` (deployed on tags matching `v*-staging`)
- **Production**: `fluxori-backend-prod` (deployed on tags matching `v*` without the `-staging` suffix)

## Authentication to Google Cloud

The workflow uses [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) for secure authentication to Google Cloud. This approach avoids storing service account keys in GitHub Secrets.

To set up Workload Identity Federation, follow these steps:

1. Create a Workload Identity Pool:
   ```bash
   gcloud iam workload-identity-pools create "github-actions-pool" \
     --location="global" \
     --description="For use with GitHub Actions" \
     --display-name="GitHub Actions Pool"
   ```

2. Create a Workload Identity Provider:
   ```bash
   gcloud iam workload-identity-pools providers create-oidc "github-provider" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

3. Allow the GitHub Actions workflow to impersonate a service account:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding "SERVICE_ACCOUNT_EMAIL" \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/ORGANIZATION/REPOSITORY"
   ```

4. Set the required secrets in your GitHub repository settings.

## Workflow Details

### Backend CI/CD Pipeline

The `backend-cicd.yml` workflow consists of the following jobs:

1. **Test and Build**:
   - Checkout the code
   - Set up Node.js
   - Install dependencies (with caching)
   - Run linters
   - Run tests
   - Build the TypeScript code
   - Upload build artifacts

2. **Deploy**:
   - Download build artifacts
   - Authenticate to Google Cloud using Workload Identity Federation
   - Build and push Docker image to Artifact Registry
   - Deploy to Cloud Run
   - Verify deployment
   - Set up vulnerability scanning

3. **Notify**:
   - Send Slack notifications on success or failure

## Security Considerations

The workflow follows these security best practices:

- Uses Workload Identity Federation instead of service account keys
- Secures sensitive configuration using Secret Manager
- Implements Docker image vulnerability scanning
- Follows the principle of least privilege for service account permissions
- Does not expose secrets in logs or environment variables

## Monitoring and Troubleshooting

- View workflow runs in the Actions tab of the GitHub repository
- Check Cloud Run logs for deployment issues
- Monitor the deployed service using Cloud Monitoring
- Receive notifications via Slack for deployment status updates
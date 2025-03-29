# Fluxori-V2 Deployment Guide

This document describes the deployment process for the Fluxori-V2 application, including environment setup, configuration, and deployment procedures.

## Table of Contents

- [Infrastructure Overview](#infrastructure-overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Manual Deployment](#manual-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Logging](#monitoring-and-logging)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Infrastructure Overview

Fluxori-V2 is deployed on Google Cloud Platform (GCP) using the following services:

- **Cloud Run**: For containerized application deployment
- **Cloud SQL**: For database hosting (PostgreSQL)
- **Cloud Storage**: For file storage and static assets
- **Firestore**: For certain real-time application features
- **Secret Manager**: For managing secrets and environment variables
- **Cloud Load Balancing**: For traffic management and SSL termination
- **Cloud Monitoring**: For application monitoring
- **Cloud Logging**: For centralized logging

The architecture is divided into three environments:
- **Development** (`dev`): For ongoing development and testing
- **Staging** (`staging`): For pre-production testing
- **Production** (`prod`): The live environment

## Prerequisites

To deploy Fluxori-V2, you'll need:

1. **Google Cloud SDK** installed and configured
2. **Docker** for containerization
3. **Terraform** (v1.0.0+) for infrastructure provisioning
4. **Node.js** (v16+) for local development and testing
5. **GitHub** access for CI/CD pipeline
6. Proper **IAM permissions** on GCP

## Environment Configuration

### Environment Variables

Each environment requires specific environment variables. Templates are provided in:

- `.env.example` - Example environment file
- `.env.dev` - Development environment
- `.env.staging` - Staging environment
- `.env.prod` - Production environment (managed as secrets)

Critical variables include:

- `NODE_ENV` - Runtime environment
- `PORT` - Application port
- `DB_URL` - Database connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GCP_PROJECT_ID` - Google Cloud project ID
- `GCS_BUCKET` - Storage bucket name

### Secret Management

Sensitive configuration values are stored in Google Secret Manager:

1. Production secrets should never be stored in version control
2. Access to secrets is restricted via IAM permissions
3. CI/CD pipelines access secrets during deployment

To add a new secret:

```bash
# Create a new secret
gcloud secrets create SECRET_NAME --replication-policy=automatic

# Add a new version of the secret
echo -n "SECRET_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-

# Grant access to the service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member=serviceAccount:SERVICE_ACCOUNT_EMAIL \
  --role=roles/secretmanager.secretAccessor
```

## Manual Deployment

### Backend Deployment

1. **Build the application**:

```bash
cd backend
npm install
npm run build
```

2. **Build the Docker image**:

```bash
docker build -t gcr.io/PROJECT_ID/fluxori-backend:VERSION .
```

3. **Push the image to Container Registry**:

```bash
docker push gcr.io/PROJECT_ID/fluxori-backend:VERSION
```

4. **Deploy to Cloud Run**:

```bash
gcloud run deploy fluxori-backend \
  --image gcr.io/PROJECT_ID/fluxori-backend:VERSION \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets JWT_SECRET=jwt-secret:latest,DB_URL=db-url:latest
```

### Frontend Deployment

1. **Build the application**:

```bash
cd frontend
npm install
npm run build
```

2. **Deploy to Cloud Storage**:

```bash
gsutil -m rsync -r -d ./build gs://BUCKET_NAME
```

3. **Set CORS and cache control**:

```bash
gsutil cors set cors.json gs://BUCKET_NAME
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://BUCKET_NAME/*.js
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" gs://BUCKET_NAME/static/**
```

## CI/CD Pipeline

Fluxori-V2 uses GitHub Actions for CI/CD. The workflow files are located in `.github/workflows/`.

### Main Workflows

- `backend-cicd.yml` - Combined backend CI/CD pipeline
- `frontend-ci.yml` - Frontend continuous integration
- `frontend-cd.yml` - Frontend continuous deployment
- `infrastructure.yml` - Infrastructure provisioning

For detailed information about the CI/CD workflows and required secrets, see the [.github/README.md](.github/README.md) file.

### Deployment Process

1. **Code is pushed** to a feature branch
2. **Pull request** is created against the main branch
3. **CI pipeline** runs tests, linting, and builds
4. After merge, the **CD pipeline**:
   - Builds and tags Docker images
   - Pushes images to Container Registry
   - Updates the deployment for the target environment
   - Runs post-deployment checks

### Environment-Specific Deployments

- Pushing to `main` deploys to the `dev` environment
- Creating a tag with format `v*-staging` deploys to the `staging` environment
- Creating a tag with format `v*` (without suffix) deploys to `production`

## Monitoring and Logging

### Monitoring

Fluxori-V2 uses Cloud Monitoring for:

- **Health checks**: HTTP endpoints for each service
- **Alerting**: Based on error rates, latency, and resource utilization
- **Dashboards**: Custom dashboards for key metrics

Access the monitoring dashboard at: https://console.cloud.google.com/monitoring/dashboards

### Logging

Application logs are sent to Cloud Logging:

- Backend logs are tagged with service name and version
- HTTP requests are logged with request path, method, status, and latency
- Error logs include stack traces and request context

To view logs:

```bash
# View recent logs for backend service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=fluxori-backend" --limit=50

# View error logs
gcloud logging read "severity>=ERROR AND resource.type=cloud_run_revision AND resource.labels.service_name=fluxori-backend" --limit=20
```

## Rollback Procedures

In case of deployment issues, follow these rollback procedures:

### Backend Rollback

```bash
# Identify the previous stable revision
gcloud run revisions list --service=fluxori-backend

# Roll back to a specific revision
gcloud run services update-traffic fluxori-backend --to-revisions=REVISION_NAME=100
```

### Frontend Rollback

```bash
# List previous versions in GCS
gsutil ls -la gs://BUCKET_NAME/.backup/

# Roll back to a previous version
gsutil -m rsync -r -d gs://BUCKET_NAME/.backup/VERSION gs://BUCKET_NAME
```

### Database Rollback

For database rollbacks, restore from the latest automated backup:

```bash
# List backups
gcloud sql backups list --instance=fluxori-db

# Restore backup
gcloud sql instances restore fluxori-db --backup-id=BACKUP_ID
```

## Troubleshooting

### Common Issues

1. **Service Unavailable (503)**
   - Check Cloud Run service health
   - Verify service account permissions
   - Check for recent deployments or config changes

2. **Database Connection Issues**
   - Verify network configuration
   - Check connection string environment variable
   - Ensure IP allowlisting is correct

3. **Authentication Failures**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Check for clock skew between services

### Support and Escalation

For deployment issues:
1. Check the logs in Cloud Logging
2. Review deployment history in Cloud Run
3. Contact the DevOps team via Slack (#devops-support)
4. For critical issues, escalate to the on-call engineer

---

Last Updated: April 29, 2025
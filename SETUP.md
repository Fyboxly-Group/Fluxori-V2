# Fluxori-V2 Setup Guide

This guide will help you set up the Fluxori-V2 application for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.x or later)
- npm (v8.x or later)
- MongoDB (v5.0 or later)
- Git
- Google Cloud SDK (for cloud integration features)

## Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/fluxori-v2.git
   cd fluxori-v2
   ```

2. **Set up environment variables**

   Create a `.env` file in the backend directory:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```
   # Server settings
   PORT=4000
   NODE_ENV=development
   
   # Database settings
   MONGO_URI=mongodb://localhost:27017/fluxori
   
   # JWT settings
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   
   # Google Cloud Storage
   GCS_PROJECT_ID=your_gcp_project_id
   GCS_BUCKET_NAME=your_gcs_bucket
   GCS_KEY_FILE=path/to/service-account-key.json
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Navigate to the frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Set up environment variables**

   Create a `.env` file in the frontend directory:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```
   VITE_API_URL=http://localhost:4000/api
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

For specific test files:

```bash
npm test -- -t "Auth Controller"
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Infrastructure

If you need to work with the infrastructure code:

1. **Install Terraform**

   Follow the [official Terraform installation guide](https://learn.hashicorp.com/tutorials/terraform/install-cli).

2. **Configure Google Cloud credentials**

   ```bash
   gcloud auth application-default login
   ```

3. **Initialize Terraform**

   ```bash
   cd infrastructure/terraform/environments/dev
   terraform init
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**

   Ensure MongoDB is running locally:

   ```bash
   sudo systemctl status mongodb
   ```

   If not running, start it:

   ```bash
   sudo systemctl start mongodb
   ```

2. **JWT Authentication Errors**

   Make sure your JWT_SECRET is properly set in the `.env` file.

3. **Google Cloud Storage Errors**

   Verify that your service account key file path is correct and the service account has the necessary permissions.

## Getting Help

If you encounter any issues not covered in this guide, please:

1. Check the existing [Issues](https://github.com/your-org/fluxori-v2/issues) on GitHub
2. Join our [Slack community](https://your-slack-invite-link)
3. Refer to the [Contributing Guide](CONTRIBUTING.md) for more information
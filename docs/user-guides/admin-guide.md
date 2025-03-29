# Fluxori-V2 Administrator Guide

This guide provides comprehensive information for system administrators managing the Fluxori-V2 platform.

## Contents

- [System Requirements](#system-requirements)
- [Installation and Setup](#installation-and-setup)
- [User Management](#user-management)
- [System Configuration](#system-configuration)
- [Data Management](#data-management)
- [Integration Configuration](#integration-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Production Environment

- **Infrastructure**: Google Cloud Platform
  - Cloud Run instances (min 2 instances for redundancy)
  - Firestore database
  - Cloud Storage buckets
  - Secret Manager for secrets
  - Pub/Sub for event handling
  - VPC configuration for security

- **Hardware Requirements**:
  - Minimum 2 vCPU, 4GB RAM per service
  - 50GB storage minimum (scales with usage)

- **Networking**:
  - HTTPS required with valid SSL certificate
  - Firewall configurations as per security guidelines
  - Static IP recommended

## Installation and Setup

### Container Deployment

Fluxori-V2 uses containerized deployment with Google Cloud Run:

1. Ensure you have the gcloud CLI installed and configured
2. Clone the production repository
3. Use the provided terraform scripts in the `/infra` directory
4. Configure the environment variables:
   ```
   cp .env.example .env
   # Edit .env file with your configuration
   ```
5. Run the deployment script:
   ```
   ./scripts/deploy.sh -e production
   ```

### Manual Setup

If deploying manually, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure the database connection
4. Set up environment variables
5. Build the frontend:
   ```
   cd frontend && npm run build
   ```
6. Start the backend server:
   ```
   cd backend && npm start
   ```

## User Management

### User Roles

Fluxori-V2 has the following role hierarchy:

- **Administrator**: Full system access
- **Manager**: Access to all data with limited administrative functions
- **Inventory Specialist**: Focused on inventory and supplier management
- **Shipping Coordinator**: Manages shipments and purchase orders
- **Customer Success**: Handles customer relationships and projects
- **Read-Only**: View-only access to all data

### Adding Users

1. Navigate to "Administration" > "User Management"
2. Click "Add User"
3. Fill in required fields:
   - Email address
   - Name
   - Role
   - Department
4. Choose permission options
5. Click "Create User"
6. The system sends an invitation email with password setup instructions

### Managing Permissions

1. Navigate to "Administration" > "Roles & Permissions"
2. Select a role to modify
3. Use the permission matrix to enable/disable specific actions
4. Custom roles can be created by cloning an existing role and modifying permissions
5. Click "Save Changes" to apply

## System Configuration

### General Settings

Access at "Administration" > "System Settings":

- **Company Information**: Update company details and branding
- **Regional Settings**: Configure timezone, date formats, and currency
- **Email Configuration**: Set up email server for notifications
- **Notification Settings**: Configure system alerts and notifications
- **Import/Export Settings**: Configure data import/export options

### Workflow Configuration

Access at "Administration" > "Workflow Settings":

- **Approval Workflows**: Configure approval chains for various processes
- **Status Transitions**: Define allowed status transitions for different entities
- **Automation Rules**: Set up automated actions based on triggers

## Data Management

### Database Maintenance

The system uses MongoDB as the primary database:

- **Backup Schedule**: Daily automated backups are stored for 30 days
- **Manual Backup**: Use "Administration" > "Backup & Restore" > "Create Backup"
- **Restore Process**: Use "Administration" > "Backup & Restore" > "Restore Backup"
- **Data Purging**: Configure data retention policies in settings

### Data Import/Export

1. Navigate to "Administration" > "Data Management"
2. Select the entity type (Inventory, Suppliers, etc.)
3. For import:
   - Download the template
   - Fill in the data
   - Upload the completed file
   - Review validation results
   - Confirm the import
4. For export:
   - Select data filters
   - Choose export format (CSV, Excel, JSON)
   - Generate and download the file

## Integration Configuration

### Shipping Carrier Integration

Configure integrations with shipping carriers:

1. Navigate to "Administration" > "Integrations" > "Shipping Carriers"
2. Select a carrier (FedEx, UPS, DHL, etc.)
3. Enter API credentials and account information
4. Configure webhook endpoints for status updates
5. Test the connection
6. Enable the integration

### Accounting System Integration

Configure integration with accounting systems:

1. Navigate to "Administration" > "Integrations" > "Accounting"
2. Select your accounting software (QuickBooks, Xero, etc.)
3. Set up OAuth authentication or API credentials
4. Configure data mapping
5. Set synchronization frequency
6. Test the connection
7. Enable the integration

### Custom API Integrations

For custom integrations:

1. Navigate to "Administration" > "Integrations" > "Custom API"
2. Create a new integration profile
3. Configure endpoint URLs, authentication, and data mapping
4. Set up webhooks for incoming data
5. Configure error handling and notifications
6. Test and enable the integration

## Monitoring and Maintenance

### System Health Dashboard

Access at "Administration" > "System Health":

- **Service Status**: Real-time status of all system components
- **Performance Metrics**: CPU, memory, and database performance
- **Error Logs**: View and filter system error logs
- **API Usage**: Monitor API call volume and response times
- **User Activity**: Track user sessions and actions

### Scheduled Maintenance

1. Navigate to "Administration" > "Maintenance"
2. Schedule maintenance windows
3. Configure user notifications
4. Enable maintenance mode when needed
5. Monitor system during and after maintenance

## Security

### Authentication Settings

Configure at "Administration" > "Security" > "Authentication":

- **Password Policy**: Set complexity requirements and rotation policy
- **Multi-Factor Authentication**: Enable and configure MFA options
- **Session Management**: Configure timeout and concurrent session policies
- **IP Restrictions**: Set up IP allowlists if needed

### Audit Logging

Access at "Administration" > "Security" > "Audit Logs":

- All security-relevant events are logged
- Logs include timestamp, user, action, and affected resources
- Filter and search logs for security investigation
- Export logs for compliance reporting

### Data Encryption

- Database encryption is enabled by default
- File uploads are encrypted at rest
- Configure encryption key rotation schedule
- Manage API key security

## Troubleshooting

### Common Issues

#### Authentication Problems

- Check user account status
- Verify correct email address
- Reset password if needed
- Check for IP restrictions

#### Performance Issues

- Review current system load
- Check for database bottlenecks
- Verify network connectivity
- Scale resources if needed

#### Integration Failures

- Verify API credentials
- Check endpoint connectivity
- Review error logs for specific messages
- Test endpoints manually if possible

### Support Resources

- **Internal Documentation**: Full technical documentation at `/docs/technical`
- **Error Code Reference**: List of all system error codes and solutions
- **Support Contact**: Email support@fluxori.com for critical issues
- **Community Forum**: Share and find solutions at community.fluxori.com

---

For more detailed technical information, please refer to the [Developer Guide](/docs/developer-guide.md) or contact technical support.
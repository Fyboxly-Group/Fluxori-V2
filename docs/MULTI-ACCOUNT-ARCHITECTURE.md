# Multi-Account Architecture

This document outlines the multi-account architecture implemented in Fluxori-V2, providing hierarchical organization structure and enhanced Role-Based Access Control (RBAC).

## Overview

The multi-account architecture enables companies to structure their organizations in a hierarchical manner, allowing for agency-client relationships, divisions within companies, and enhanced permission management. The system includes enhanced RBAC with custom role definitions, tenant isolation for security, and comprehensive user management across organizational units.

## Features

### Hierarchical Organization Structure

- **Parent-Child Relationships**: Organizations can have parent-child relationships, creating a hierarchical structure.
- **Organization Types**: Support for different organization types (BASIC, PROFESSIONAL, ENTERPRISE, AGENCY).
- **Agency-Client Model**: Agency organizations can create and manage client organizations.
- **Organization Settings**: Customizable settings at the organization level.

### Enhanced RBAC System

- **Fine-Grained Permissions**: Permissions are defined as resource:action pairs (e.g., `inventory:read`, `organization:create`).
- **Custom Roles**: Organizations can define custom roles with specific permission sets.
- **System Roles**: Predefined system roles (Admin, Owner, Member, etc.) with appropriate permissions.
- **Role Inheritance**: Roles can inherit permissions from other roles.
- **Organization-Specific Roles**: Roles can be scoped to specific organizations.

### Tenant Isolation

- **Data Segregation**: Each organization's data is isolated from other organizations.
- **Cross-Organization Access**: Controlled access between parent and child organizations.
- **Organization Context**: All operations are performed within an organization context.
- **Multi-Tenant Authentication**: JWT authentication with organization context.

### User Management

- **User Invitations**: Secure user provisioning through invitations.
- **Membership Types**: Different membership types (member, admin, owner) with associated permissions.
- **Custom Per-User Permissions**: Addition of custom permissions and restrictions at the user level.
- **Default Organization Settings**: Users can set a default organization for their session.

### Audit Logging

- **Security Audit Trails**: Comprehensive logging of security-relevant actions.
- **Access Tracking**: Logging of access decisions and permission checks.
- **Organization Scoping**: Audit logs are scoped to specific organizations.
- **Severity Levels**: Different severity levels for audit events (INFO, WARNING, ERROR, CRITICAL).

## Data Models

### Organization Schema

The organization schema defines the structure of an organization, including:

- Organization details (name, type, status)
- Parent-child relationships
- Settings and metadata
- Creation and modification timestamps

### Role Schema

The role schema defines the structure of roles, including:

- Role name and description
- Permission sets
- Organization scope
- System role flag
- Creation and modification timestamps

### User-Organization Schema

The user-organization schema maps users to organizations, including:

- Membership type and status
- Assigned roles
- Custom permissions and restrictions
- Default organization settings
- Creation and modification timestamps

### Invitation Schema

The invitation schema handles user provisioning, including:

- Invitation details (email, roles, message)
- Expiration and verification tokens
- Status tracking
- Creation and modification timestamps

### Audit Log Schema

The audit log schema provides comprehensive security logging, including:

- Actor information (user, IP, user agent)
- Organization context
- Action category and type
- Resource details
- Severity level
- Creation timestamp

### Resource Sharing Schema

The resource sharing schema enables cross-organization resource sharing, including:

- Resource type and ID
- Source and target organizations
- Access level and sharing type
- Creation and modification timestamps

## API Endpoints

### Organization Endpoints

- `GET /api/organizations` - Get all organizations the user has access to
- `GET /api/organizations/hierarchy` - Get organization hierarchy
- `GET /api/organizations/child-organizations` - Get child organizations
- `POST /api/organizations` - Create a new organization
- `POST /api/organizations/client` - Create a new client organization (Agency only)
- `GET /api/organizations/current` - Get current organization details
- `GET /api/organizations/{id}` - Get organization by ID
- `PUT /api/organizations/{id}` - Update organization
- `PUT /api/organizations/{id}/type` - Update organization type (System Admin only)
- `DELETE /api/organizations/{id}` - Delete organization
- `POST /api/organizations/{id}/transfer-ownership` - Transfer organization ownership

### Role Endpoints

- `GET /api/roles` - Get all roles for the current organization
- `GET /api/roles/system` - Get all system-defined roles
- `POST /api/roles` - Create a new custom role
- `GET /api/roles/{id}` - Get role by ID
- `PUT /api/roles/{id}` - Update a role
- `DELETE /api/roles/{id}` - Delete a custom role
- `GET /api/roles/permissions/available` - Get all available permissions
- `GET /api/roles/user/{userId}` - Get a user's effective permissions

### Membership Endpoints

- `GET /api/memberships` - Get all users in the current organization
- `GET /api/memberships/my-memberships` - Get current user's memberships
- `GET /api/memberships/invitations` - Get pending invitations for the current organization
- `GET /api/memberships/my-invitations` - Get pending invitations for the current user
- `POST /api/memberships/invite` - Invite a user to the organization
- `POST /api/memberships/invitations/{id}/accept` - Accept an invitation
- `POST /api/memberships/invitations/{id}/decline` - Decline an invitation
- `POST /api/memberships/invitations/{id}/cancel` - Cancel a pending invitation
- `POST /api/memberships/invitations/{id}/resend` - Resend an invitation
- `GET /api/memberships/{userId}` - Get user's membership details
- `PUT /api/memberships/{userId}/roles` - Update user roles
- `PUT /api/memberships/{userId}/custom-permissions` - Update user custom permissions
- `PUT /api/memberships/{userId}/type` - Update user membership type
- `DELETE /api/memberships/{userId}` - Remove a user from the organization
- `POST /api/memberships/leave` - Leave the current organization

## Authentication Middleware

The multi-tenant authentication middleware enhances the standard authentication with organization context:

- Verifies JWT tokens with user and organization information
- Loads user's organization memberships
- Determines the active organization context
- Calculates effective permissions based on roles and custom permissions
- Attaches the enhanced user object to the request

## Permission Checking Middleware

The permission checking middleware ensures that users have the required permissions:

- `requirePermission` - Checks if the user has specific permissions
- `requireOrganizationOwner` - Checks if the user is an organization owner
- `requireSystemAdmin` - Checks if the user is a system administrator
- `logApiAccess` - Logs API access with security-relevant information

## Security Considerations

### JWT Token Security

- Tokens include both user and organization information
- Short expiration times to reduce risk
- Secure storage in HTTP-only cookies

### Tenant Isolation

- All database queries are scoped to the current organization
- Permission checks at the API and service layers
- Data leakage prevention through careful query design

### Audit Logging

- All security-relevant actions are logged
- Log tampering protection through immutable timestamps
- Regular log review for security analysis

## Integration

### Frontend Integration

- Organization selector in the UI header
- Role management interface
- User invitation and management screens
- Organization settings and hierarchy visualization

### Backend Integration

- All services modified to be organization-aware
- Data access patterns updated for multi-tenancy
- Cross-organization operations carefully controlled

## Implementation Details

The multi-account architecture is implemented using Firestore with carefully designed schemas and collections. The design supports:

- Scalability to thousands of organizations
- Efficient permission calculations
- Real-time organization switching
- Comprehensive audit logging

## Future Enhancements

- Cross-organization resource sharing improvements
- Organization templates for standardized roles
- Advanced analytics for organization hierarchy
- Delegation of administrative functions

## Conclusion

The multi-account architecture provides a robust foundation for complex organization structures and fine-grained access control. It enables agency-client relationships, divisions within companies, and comprehensive permission management while maintaining strong security and data isolation.
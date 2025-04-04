/**
 * Role Service
 * Handles operations related to roles and permissions in Firestore
 */
import { Timestamp } from 'firebase-admin/firestore';
import {
  rolesCollection,
  userOrganizationsCollection,
  auditLogsCollection
} from '../../config/firestore';
import {
  IRole,
  IRoleWithId,
  RoleScope,
  Permission,
  PermissionResource,
  PermissionAction,
  roleConverter,
  createCustomRole,
  systemRoles,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter,
  userOrganizationConverter
} from '../../models/firestore';

/**
 * Service for role and permission management
 */
export class RoleService {
  /**
   * Create a custom role
   * @param name Role name
   * @param description Role description
   * @param organizationId Organization ID
   * @param permissions Array of permissions
   * @param userId User ID creating the role
   * @param userEmail User email creating the role
   * @returns Created role with ID
   */
  async createRole(
    name: string,
    description: string,
    organizationId: string,
    permissions: Permission[],
    userId: string,
    userEmail: string
  ): Promise<IRoleWithId> {
    // Check if a role with this name already exists in the organization
    const existingRoleSnapshot = await rolesCollection
      .where('organizationId', '==', organizationId)
      .where('name', '==', name)
      .limit(1)
      .get();
    
    if (!existingRoleSnapshot.empty) {
      throw new Error(`Role with name "${name}" already exists in this organization`);
    }
    
    // Create the role
    const role = createCustomRole(name, description, organizationId, permissions, userId);
    
    // Add to Firestore
    const roleRef = rolesCollection.withConverter(roleConverter).doc();
    await roleRef.set(role);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      userId,
      userEmail,
      organizationId,
      AuditCategory.ROLE,
      AuditAction.CREATE,
      'role',
      `Role "${name}" created`,
      {
        resourceId: roleRef.id,
        severity: AuditSeverity.INFO,
        metadata: {
          role
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Get the created role
    const snapshot = await roleRef.get();
    return snapshot.data() as IRoleWithId;
  }
  
  /**
   * Get role by ID
   * @param id Role ID
   * @returns Role or null if not found
   */
  async getRoleById(id: string): Promise<IRoleWithId | null> {
    const snapshot = await rolesCollection.withConverter(roleConverter).doc(id).get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as IRoleWithId;
  }
  
  /**
   * Update a role
   * @param id Role ID
   * @param data Update data
   * @param userId User ID performing the update
   * @param userEmail User email performing the update
   * @returns Updated role
   */
  async updateRole(
    id: string,
    data: Partial<IRole>,
    userId: string,
    userEmail: string
  ): Promise<IRoleWithId> {
    // Get the role to check if it exists
    const role = await this.getRoleById(id);
    if (!role) {
      throw new Error(`Role ${id} not found`);
    }
    
    // Check if role is built-in and reject if trying to modify a built-in role
    if (role.isBuiltIn) {
      throw new Error(`Cannot modify built-in role "${role.name}"`);
    }
    
    // Remove immutable fields from update data
    const { 
      createdAt, updatedAt, isBuiltIn, scope, organizationId, createdBy, ...updateData 
    } = data as any;
    
    // Set the updatedAt timestamp
    updateData.updatedAt = Timestamp.now();
    
    // Update the role
    await rolesCollection.withConverter(roleConverter).doc(id).update(updateData);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      userId,
      userEmail,
      role.organizationId || 'system',
      AuditCategory.ROLE,
      AuditAction.UPDATE,
      'role',
      `Role "${role.name}" updated`,
      {
        resourceId: id,
        severity: AuditSeverity.INFO,
        metadata: {
          before: role,
          after: { ...role, ...updateData }
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Get the updated role
    const snapshot = await rolesCollection.withConverter(roleConverter).doc(id).get();
    return snapshot.data() as IRoleWithId;
  }
  
  /**
   * Delete a role
   * @param id Role ID
   * @param userId User ID performing the delete
   * @param userEmail User email performing the delete
   * @returns Success boolean
   */
  async deleteRole(
    id: string,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    // Get the role to check if it exists
    const role = await this.getRoleById(id);
    if (!role) {
      throw new Error(`Role ${id} not found`);
    }
    
    // Check if role is built-in and reject if trying to delete a built-in role
    if (role.isBuiltIn) {
      throw new Error(`Cannot delete built-in role "${role.name}"`);
    }
    
    // Check if this role is assigned to any users
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('roles', 'array-contains', id)
      .limit(1)
      .get();
    
    if (!userOrgsSnapshot.empty) {
      throw new Error(`Cannot delete role "${role.name}" because it is assigned to users`);
    }
    
    // Create audit log entry before deletion
    const auditLog = createAuditLog(
      userId,
      userEmail,
      role.organizationId || 'system',
      AuditCategory.ROLE,
      AuditAction.DELETE,
      'role',
      `Role "${role.name}" deleted`,
      {
        resourceId: id,
        severity: AuditSeverity.WARNING,
        metadata: {
          role
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Delete the role
    await rolesCollection.doc(id).delete();
    
    return true;
  }
  
  /**
   * Get organization roles
   * @param organizationId Organization ID
   * @returns Array of roles for the organization
   */
  async getOrganizationRoles(organizationId: string): Promise<IRoleWithId[]> {
    const snapshot = await rolesCollection
      .withConverter(roleConverter)
      .where('organizationId', '==', organizationId)
      .get();
    
    // Also get system roles, which apply to all organizations
    const systemRolesSnapshot = await rolesCollection
      .withConverter(roleConverter)
      .where('scope', '==', RoleScope.SYSTEM)
      .get();
    
    // Combine organization-specific and system roles
    const orgRoles = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    const sysRoles = systemRolesSnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    
    return [...orgRoles, ...sysRoles];
  }
  
  /**
   * Get all system roles
   * @returns Array of system roles
   */
  async getSystemRoles(): Promise<IRoleWithId[]> {
    const snapshot = await rolesCollection
      .withConverter(roleConverter)
      .where('scope', '==', RoleScope.SYSTEM)
      .get();
    
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Assign role to user in organization
   * @param roleId Role ID
   * @param userId User ID to assign role to
   * @param organizationId Organization ID
   * @param actorId User ID performing the assignment
   * @param actorEmail User email performing the assignment
   * @returns Success boolean
   */
  async assignRoleToUser(
    roleId: string,
    userId: string,
    organizationId: string,
    actorId: string,
    actorEmail: string
  ): Promise<boolean> {
    // Get the role to check if it exists
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    
    // Check if role is for this organization or is a system role
    if (
      role.scope === RoleScope.ORGANIZATION && 
      role.organizationId !== organizationId
    ) {
      throw new Error(`Role ${roleId} does not belong to organization ${organizationId}`);
    }
    
    // Get user-organization relationship
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgsSnapshot.empty) {
      throw new Error(`User ${userId} is not a member of organization ${organizationId}`);
    }
    
    const userOrgRef = userOrgsSnapshot.docs[0].ref;
    const userOrg = userOrgsSnapshot.docs[0].data();
    
    // Check if user already has this role
    if (userOrg.roles.includes(roleId)) {
      return true; // Role already assigned
    }
    
    // Add role to user-organization roles array
    const newRoles = [...userOrg.roles, roleId];
    await userOrgRef.update({
      roles: newRoles,
      updatedAt: Timestamp.now()
    });
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      organizationId,
      AuditCategory.ROLE,
      AuditAction.ASSIGN,
      'role',
      `Role "${role.name}" assigned to user ${userId}`,
      {
        resourceId: roleId,
        severity: AuditSeverity.INFO,
        metadata: {
          roleId,
          userId,
          organizationId,
          previousRoles: userOrg.roles,
          newRoles
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    return true;
  }
  
  /**
   * Remove role from user in organization
   * @param roleId Role ID
   * @param userId User ID to remove role from
   * @param organizationId Organization ID
   * @param actorId User ID performing the removal
   * @param actorEmail User email performing the removal
   * @returns Success boolean
   */
  async removeRoleFromUser(
    roleId: string,
    userId: string,
    organizationId: string,
    actorId: string,
    actorEmail: string
  ): Promise<boolean> {
    // Get the role to check if it exists
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }
    
    // Get user-organization relationship
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgsSnapshot.empty) {
      throw new Error(`User ${userId} is not a member of organization ${organizationId}`);
    }
    
    const userOrgRef = userOrgsSnapshot.docs[0].ref;
    const userOrg = userOrgsSnapshot.docs[0].data();
    
    // Check if user has this role
    if (!userOrg.roles.includes(roleId)) {
      return true; // Role not assigned, nothing to do
    }
    
    // Check if this is the Owner trying to remove their owner role, which is not allowed
    if (userOrg.type === 'owner' && role.name === 'Organization Owner') {
      throw new Error(`Cannot remove owner role from organization owner`);
    }
    
    // Remove role from user-organization roles array
    const newRoles = userOrg.roles.filter((id: any) => id !== roleId);
    
    // Ensure user has at least one role - use Member if removing the last role
    if (newRoles.length === 0) {
      // Find the default Member role
      const memberRoleSnapshot = await rolesCollection
        .withConverter(roleConverter)
        .where('scope', '==', RoleScope.SYSTEM)
        .where('name', '==', 'Member')
        .limit(1)
        .get();
      
      if (!memberRoleSnapshot.empty) {
        const memberRole = memberRoleSnapshot.docs[0];
        newRoles.push(memberRole.id);
      }
    }
    
    await userOrgRef.update({
      roles: newRoles,
      updatedAt: Timestamp.now()
    });
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      organizationId,
      AuditCategory.ROLE,
      AuditAction.REVOKE,
      'role',
      `Role "${role.name}" removed from user ${userId}`,
      {
        resourceId: roleId,
        severity: AuditSeverity.INFO,
        metadata: {
          roleId,
          userId,
          organizationId,
          previousRoles: userOrg.roles,
          newRoles
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    return true;
  }
  
  /**
   * Check if a user has a permission for a resource
   * @param userId User ID
   * @param organizationId Organization ID
   * @param resource Resource type
   * @param action Action type
   * @param resourceId Optional specific resource ID
   * @returns Boolean indicating if user has the permission
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    resource: string,
    action: string,
    resourceId?: string
  ): Promise<boolean> {
    // Get user-organization relationship
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgsSnapshot.empty) {
      return false; // User is not a member of the organization
    }
    
    const userOrg = userOrgsSnapshot.docs[0].data();
    
    // Always check for owner first - owners have full access
    if (userOrg.type === 'owner') {
      return true;
    }
    
    // Check custom permissions
    if (userOrg.permissions?.customPermissions) {
      const customPermission = `${resource}:${action}`;
      if (userOrg.permissions.customPermissions.includes(customPermission)) {
        return true;
      }
    }
    
    // Check restricted permissions
    if (userOrg.permissions?.restrictedPermissions) {
      const restrictedPermission = `${resource}:${action}`;
      if (userOrg.permissions.restrictedPermissions.includes(restrictedPermission)) {
        return false;
      }
    }
    
    // Check role-based permissions
    for (const roleId of userOrg.roles) {
      const role = await this.getRoleById(roleId);
      if (!role) continue;
      
      // Check if role has the permission
      for (const permission of role.permissions) {
        // Check for wildcard permissions
        if (
          (permission.resource === '*' || permission.resource === resource) &&
          (permission.action === '*' || permission.action === action)
        ) {
          // If there are conditions, evaluate them
          if (permission.conditions && permission.conditions.length > 0) {
            // For a complete implementation, we would evaluate conditions here
            // This would require additional context about the resource
            
            // For simplicity, we'll return true for now
            return true;
          } else {
            return true; // No conditions, permission granted
          }
        }
      }
    }
    
    return false; // No matching permission found
  }
  
  /**
   * Initialize system roles
   * Creates default system roles if they don't exist
   */
  async initializeSystemRoles(): Promise<void> {
    const batch = rolesCollection.firestore.batch();
    const now = Timestamp.now();
    
    for (const role of systemRoles) {
      // Create a role ID based on the role name
      const roleId = `system-${role.name.toLowerCase().replace(/\s+/g, '-')}`;
      const roleRef = rolesCollection.doc(roleId);
      
      // Check if role already exists
      const existingRole = await roleRef.get();
      if (!existingRole.exists) {
        // Add role to batch
        batch.set(roleRef, {
          ...role,
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    // Commit the batch
    await batch.commit();
  }
  
  /**
   * Get a user's effective permissions for an organization
   * Combines permissions from all assigned roles
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Set of effective permissions
   */
  async getUserEffectivePermissions(
    userId: string,
    organizationId: string
  ): Promise<Set<string>> {
    // Get user-organization relationship
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgsSnapshot.empty) {
      return new Set(); // User is not a member of the organization
    }
    
    const userOrg = userOrgsSnapshot.docs[0].data();
    const permissions = new Set<string>();
    
    // Add custom permissions
    if (userOrg.permissions?.customPermissions) {
      userOrg.permissions.customPermissions.forEach((perm: any) => {
        permissions.add(perm);
      });
    }
    
    // Get permissions from all roles
    for (const roleId of userOrg.roles) {
      const role = await this.getRoleById(roleId);
      if (!role) continue;
      
      // Add each permission
      role.permissions.forEach((permission: any) => {
        const permString = `${permission.resource}:${permission.action}`;
        permissions.add(permString);
        
        // Add wildcard permissions
        if (permission.resource === '*') {
          Object.values(PermissionResource).forEach((resource: any) => {
            const wildcardPerm = `${resource}:${permission.action}`;
            permissions.add(wildcardPerm);
          });
        }
        
        if (permission.action === '*') {
          Object.values(PermissionAction).forEach((action: any) => {
            const wildcardPerm = `${permission.resource}:${action}`;
            permissions.add(wildcardPerm);
          });
        }
        
        if (permission.resource === '*' && permission.action === '*') {
          Object.values(PermissionResource).forEach((resource: any) => {
            Object.values(PermissionAction).forEach((action: any) => {
              const wildcardPerm = `${resource}:${action}`;
              permissions.add(wildcardPerm);
            });
          });
        }
      });
    }
    
    // Remove restricted permissions
    if (userOrg.permissions?.restrictedPermissions) {
      userOrg.permissions.restrictedPermissions.forEach((perm: any) => {
        permissions.delete(perm);
      });
    }
    
    return permissions;
  }
}
// @ts-nocheck - Added by final-ts-fix.js
/**
 * User-Organization Service
 * Handles operations related to user memberships in organizations
 */
import { Timestamp } from 'firebase-admin/firestore';
import {
  userOrganizationsCollection,
  auditLogsCollection,
  organizationsCollection,
  rolesCollection,
  firebaseUsersCollection
} from '../../config/firestore';
import {
  IUserOrganization,
  IUserOrganizationWithId,
  MembershipStatus,
  MembershipType,
  userOrganizationConverter,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter,
  organizationConverter,
  roleConverter,
  RoleScope,
  userConverter,
  UserStatus
} from '../../models/firestore';

import { WithId } from '../../types';

/**
 * Service for user-organization management
 */
export class UserOrganizationService {
  /**
   * Add a user to an organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param roles Array of role IDs
   * @param type Membership type
   * @param actorId User ID performing the action
   * @param actorEmail User email performing the action
   * @returns Created user-organization relationship
   */
  async addUserToOrganization(
    userId: string,
    organizationId: string,
    roles: string[] = [],
    type: MembershipType = MembershipType.MEMBER,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user already belongs to this organization
    const existingSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      // User already belongs to this organization
      const existing = existingSnapshot.docs[0].data();
      
      // If the membership is not active, reactivate it
      if (existing.status !== MembershipStatus.ACTIVE) {
        return await this.updateUserOrganization(
          existing.id,
          {
            status: MembershipStatus.ACTIVE,
            roles,
            type
          },
          actorId,
          actorEmail
        );
      }
      
      // Otherwise, return the existing relationship
      return existing;
    }
    
    // Check if the organization exists
    const orgSnapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .doc(organizationId)
      .get();
    
    if (!orgSnapshot.exists) {
      throw new Error(`Organization ${organizationId} not found`);
    }
    
    // Check if the user exists
    const userSnapshot = await firebaseUsersCollection
      .withConverter(userConverter)
      .doc(userId)
      .get();
    
    if (!userSnapshot.exists) {
      throw new Error(`User ${userId} not found`);
    }
    
    // If no roles provided, get default member role
    if (roles.length === 0) {
      // Get the default 'Member' role
      const memberRoleSnapshot = await rolesCollection
        .withConverter(roleConverter)
        .where('scope', '==', RoleScope.SYSTEM)
        .where('name', '==', 'Member')
        .limit(1)
        .get();
      
      if (!memberRoleSnapshot.empty) {
        roles = [memberRoleSnapshot.docs[0].id];
      }
    }
    
    // Create user-organization relationship
    const now = Timestamp.now();
    const userOrg: IUserOrganization = {
      userId,
      organizationId,
      status: MembershipStatus.ACTIVE,
      type,
      roles,
      isDefault: false, // Will be set to true if this is the user's first organization
      joinedAt: now,
      createdAt: now,
      updatedAt: now
    };
    
    // Check if this should be the user's default organization
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();
    
    if (userOrgsSnapshot.empty) {
      userOrg.isDefault = true;
      
      // Also update the user's defaultOrganizationId
      await firebaseUsersCollection.doc(userId).update({
        defaultOrganizationId: organizationId,
        updatedAt: now
      });
    }
    
    // Create record in Firestore
    const userOrgRef = userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc();
    
    await userOrgRef.set(userOrg);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      organizationId,
      AuditCategory.ORGANIZATION,
      AuditAction.JOIN,
      'user-organization',
      `User ${userId} added to organization`,
      {
        resourceId: userOrgRef.id,
        severity: AuditSeverity.INFO,
        metadata: {
          userId,
          organizationId,
          type,
          roles
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Add this organization to the user's organizations array
    const user = userSnapshot.data();
    const userOrgs = user?.organizations || [];
    
    if (!userOrgs.includes(organizationId)) {
      await firebaseUsersCollection.doc(userId).update({
        organizations: [...userOrgs, organizationId],
        updatedAt: now
      });
    }
    
    // Get the created user-organization
    const snapshot = await userOrgRef.get();
    return snapshot.data() as IUserOrganizationWithId;
  }
  
  /**
   * Get user-organization by ID
   * @param id User-organization ID
   * @returns User-organization or null if not found
   */
  async getUserOrganizationById(id: string): Promise<IUserOrganizationWithId | null> {
    const snapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc(id)
      .get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as IUserOrganizationWithId;
  }
  
  /**
   * Update user-organization
   * @param id User-organization ID
   * @param data Update data
   * @param actorId User ID performing the update
   * @param actorEmail User email performing the update
   * @returns Updated user-organization
   */
  async updateUserOrganization(
    id: string,
    data: Partial<IUserOrganization>,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Get the user-organization to check if it exists
    const userOrg = await this.getUserOrganizationById(id);
    if (!userOrg) {
      throw new Error(`User-organization ${id} not found`);
    }
    
    // Remove immutable fields from update data
    const {
      userId, organizationId, createdAt, updatedAt, ...updateData
    } = data as any;
    
    // Set the updatedAt timestamp
    updateData.updatedAt = Timestamp.now();
    
    // Update the user-organization
    await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc(id)
      .update(updateData);
    
    // If isDefault is being set to true, update all other user-orgs for this user
    if (updateData.isDefault === true) {
      // Get all user-organizations for this user
      const userOrgsSnapshot = await userOrganizationsCollection
        .withConverter(userOrganizationConverter)
        .where('userId', '==', userOrg.userId)
        .where('isDefault', '==', true)
        .where('id', '!=', id)
        .get();
      
      // Update all other default orgs to not be default
      const batch = userOrganizationsCollection.firestore.batch();
      userOrgsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false, updatedAt: Timestamp.now() });
      });
      
      if (!userOrgsSnapshot.empty) {
        await batch.commit();
      }
      
      // Update the user's defaultOrganizationId
      await firebaseUsersCollection.doc(userOrg.userId).update({
        defaultOrganizationId: userOrg.organizationId,
        updatedAt: Timestamp.now()
      });
    }
    
    // If status is being changed to REMOVED, update the user's organizations array
    if (updateData.status === MembershipStatus.REMOVED) {
      const userSnapshot = await firebaseUsersCollection.doc(userOrg.userId).get();
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        if (userData?.organizations) {
          const updatedOrgs = userData.organizations.filter(
            (orgId: string) => orgId !== userOrg.organizationId
          );
          
          await firebaseUsersCollection.doc(userOrg.userId).update({
            organizations: updatedOrgs,
            updatedAt: Timestamp.now()
          });
          
          // If this was the user's default organization, set a new default if available
          if (userOrg.isDefault) {
            const remainingOrgsSnapshot = await userOrganizationsCollection
              .withConverter(userOrganizationConverter)
              .where('userId', '==', userOrg.userId)
              .where('status', '==', MembershipStatus.ACTIVE)
              .limit(1)
              .get();
            
            if (!remainingOrgsSnapshot.empty) {
              const newDefault = remainingOrgsSnapshot.docs[0].data();
              await userOrganizationsCollection.doc(newDefault.id).update({
                isDefault: true,
                updatedAt: Timestamp.now()
              });
              
              await firebaseUsersCollection.doc(userOrg.userId).update({
                defaultOrganizationId: newDefault.organizationId,
                updatedAt: Timestamp.now()
              });
            } else {
              // No more active organizations for user
              await firebaseUsersCollection.doc(userOrg.userId).update({
                defaultOrganizationId: null,
                updatedAt: Timestamp.now()
              });
            }
          }
        }
      }
    }
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      userOrg.organizationId,
      AuditCategory.USER,
      AuditAction.UPDATE,
      'user-organization',
      `User membership updated for ${userOrg.userId}`,
      {
        resourceId: id,
        severity: AuditSeverity.INFO,
        metadata: {
          before: userOrg,
          after: { ...userOrg, ...updateData },
          userId: userOrg.userId,
          organizationId: userOrg.organizationId
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Get the updated user-organization
    const snapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc(id)
      .get();
    
    return snapshot.data() as IUserOrganizationWithId;
  }
  
  /**
   * Remove user from organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param actorId User ID performing the removal
   * @param actorEmail User email performing the removal
   * @returns Success boolean
   */
  async removeUserFromOrganization(
    userId: string,
    organizationId: string,
    actorId: string,
    actorEmail: string
  ): Promise<boolean> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not a member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // Check if this is the organization owner - owners cannot be removed
    if (userOrg.type === MembershipType.OWNER) {
      throw new Error(`Cannot remove organization owner from organization`);
    }
    
    // Update user-organization status to REMOVED
    await this.updateUserOrganization(
      (userOrg as any).id,
      { status: MembershipStatus.REMOVED },
      actorId,
      actorEmail
    );
    
    return true;
  }
  
  /**
   * Get user's organizations with membership details
   * @param userId User ID
   * @returns Array of user-organization relationships
   */
  async getUserOrganizationMemberships(userId: string): Promise<IUserOrganizationWithId[]> {
    const snapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get organization members
   * @param organizationId Organization ID
   * @returns Array of user-organization relationships
   */
  async getOrganizationMembers(organizationId: string): Promise<IUserOrganizationWithId[]> {
    const snapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get organization members by role
   * @param organizationId Organization ID
   * @param roleId Role ID
   * @returns Array of user-organization relationships
   */
  async getOrganizationMembersByRole(
    organizationId: string,
    roleId: string
  ): Promise<IUserOrganizationWithId[]> {
    const snapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .where('roles', 'array-contains', roleId)
      .get();
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Change user's membership type in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param newType New membership type
   * @param actorId User ID performing the change
   * @param actorEmail User email performing the change
   * @returns Updated user-organization
   */
  async changeUserMembershipType(
    userId: string,
    organizationId: string,
    newType: MembershipType,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not a member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // If changing to OWNER, handle special case
    if (newType === MembershipType.OWNER) {
      // Get current organization
      const orgSnapshot = await organizationsCollection
        .withConverter(organizationConverter)
        .doc(organizationId)
        .get();
      
      if (!orgSnapshot.exists) {
        throw new Error(`Organization ${organizationId} not found`);
      }
      
      const org = orgSnapshot.data();
      
      // Get current owner's user-organization
      const currentOwnerSnapshot = await userOrganizationsCollection
        .withConverter(userOrganizationConverter)
        .where('userId', '==', org.ownerId)
        .where('organizationId', '==', organizationId)
        .where('type', '==', MembershipType.OWNER)
        .limit(1)
        .get();
      
      if (!currentOwnerSnapshot.empty) {
        // Update current owner's membership type to MEMBER
        await userOrganizationsCollection.doc(currentOwnerSnapshot.docs[0].id).update({
          type: MembershipType.MEMBER,
          updatedAt: Timestamp.now()
        });
      }
      
      // Update organization ownerId
      await organizationsCollection.doc(organizationId).update({
        ownerId: userId,
        updatedAt: Timestamp.now()
      });
      
      // Find 'Organization Owner' role
      const ownerRoleSnapshot = await rolesCollection
        .withConverter(roleConverter)
        .where('scope', '==', RoleScope.SYSTEM)
        .where('name', '==', 'Organization Owner')
        .limit(1)
        .get();
      
      // Update user's roles to include owner role
      let roles = [...userOrg.roles];
      if (!ownerRoleSnapshot.empty) {
        const ownerRoleId = ownerRoleSnapshot.docs[0].id;
        if (!roles.includes(ownerRoleId)) {
          roles.push(ownerRoleId);
        }
      }
      
      // Update the user-organization
      return await this.updateUserOrganization(
        (userOrg as any).id,
        {
          type: newType,
          roles
        },
        actorId,
        actorEmail
      );
    } else {
      // For other membership types, simply update the type
      return await this.updateUserOrganization(
        (userOrg as any).id,
        { type: newType },
        actorId,
        actorEmail
      );
    }
  }
  
  /**
   * Set organization as user's default
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Updated user-organization
   */
  async setDefaultOrganization(
    userId: string,
    organizationId: string,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not an active member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // If already default, nothing to do
    if (userOrg.isDefault) {
      return userOrg;
    }
    
    // Update user's default organization
    await this.updateUserOrganization(
      (userOrg as any).id,
      { isDefault: true },
      actorId,
      actorEmail
    );
    
    // Update user's defaultOrganizationId
    await firebaseUsersCollection.doc(userId).update({
      defaultOrganizationId: organizationId,
      lastActiveOrganizationId: organizationId,
      updatedAt: Timestamp.now()
    });
    
    // Get updated user-organization
    const updatedSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc((userOrg as any).id)
      .get();
    
    return updatedSnapshot.data() as IUserOrganizationWithId;
  }
  
  /**
   * Get user's active organization
   * @param userId User ID
   * @returns Active organization or null
   */
  async getUserActiveOrganization(userId: string): Promise<IUserOrganizationWithId | null> {
    // Get user to find last active or default organization
    const userSnapshot = await firebaseUsersCollection
      .withConverter(userConverter)
      .doc(userId)
      .get();
    
    if (!userSnapshot.exists) {
      return null;
    }
    
    const user = userSnapshot.data();
    const orgId = user.lastActiveOrganizationId || user.defaultOrganizationId;
    
    if (!orgId) {
      // No active or default organization, try to find any active membership
      const userOrgsSnapshot = await userOrganizationsCollection
        .withConverter(userOrganizationConverter)
        .where('userId', '==', userId)
        .where('status', '==', MembershipStatus.ACTIVE)
        .limit(1)
        .get();
      
      if (userOrgsSnapshot.empty) {
        return null;
      }
      
      return userOrgsSnapshot.docs[0].data();
    }
    
    // Get the specific user-organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', orgId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      return null;
    }
    
    return userOrgSnapshot.docs[0].data();
  }
  
  /**
   * Add custom permission to user in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permission Permission string (resource:action)
   * @param actorId User ID performing the action
   * @param actorEmail User email performing the action
   * @returns Updated user-organization
   */
  async addCustomPermission(
    userId: string,
    organizationId: string,
    permission: string,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not an active member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // Get current permissions
    const permissions = userOrg.permissions || {};
    const customPermissions = permissions.customPermissions || [];
    
    // Check if permission already exists
    if (customPermissions.includes(permission)) {
      return userOrg; // Permission already granted
    }
    
    // Add permission to the list
    const updatedCustomPermissions = [...customPermissions, permission];
    
    // Update user-organization
    return await this.updateUserOrganization(
      (userOrg as any).id,
      {
        permissions: {
          ...permissions,
          customPermissions: updatedCustomPermissions
        }
      },
      actorId,
      actorEmail
    );
  }
  
  /**
   * Remove custom permission from user in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permission Permission string (resource:action)
   * @param actorId User ID performing the action
   * @param actorEmail User email performing the action
   * @returns Updated user-organization
   */
  async removeCustomPermission(
    userId: string,
    organizationId: string,
    permission: string,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not an active member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // Get current permissions
    const permissions = userOrg.permissions || {};
    const customPermissions = permissions.customPermissions || [];
    
    // Check if permission exists
    if (!customPermissions.includes(permission)) {
      return userOrg; // Permission not found
    }
    
    // Remove permission from the list
    const updatedCustomPermissions = customPermissions.filter(p => p !== permission);
    
    // Update user-organization
    return await this.updateUserOrganization(
      (userOrg as any).id,
      {
        permissions: {
          ...permissions,
          customPermissions: updatedCustomPermissions
        }
      },
      actorId,
      actorEmail
    );
  }
  
  /**
   * Add restricted permission to user in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permission Permission string (resource:action)
   * @param actorId User ID performing the action
   * @param actorEmail User email performing the action
   * @returns Updated user-organization
   */
  async addRestrictedPermission(
    userId: string,
    organizationId: string,
    permission: string,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not an active member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // Get current permissions
    const permissions = userOrg.permissions || {};
    const restrictedPermissions = permissions.restrictedPermissions || [];
    
    // Check if restriction already exists
    if (restrictedPermissions.includes(permission)) {
      return userOrg; // Restriction already in place
    }
    
    // Add restriction to the list
    const updatedRestrictedPermissions = [...restrictedPermissions, permission];
    
    // Update user-organization
    return await this.updateUserOrganization(
      (userOrg as any).id,
      {
        permissions: {
          ...permissions,
          restrictedPermissions: updatedRestrictedPermissions
        }
      },
      actorId,
      actorEmail
    );
  }
  
  /**
   * Remove restricted permission from user in organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @param permission Permission string (resource:action)
   * @param actorId User ID performing the action
   * @param actorEmail User email performing the action
   * @returns Updated user-organization
   */
  async removeRestrictedPermission(
    userId: string,
    organizationId: string,
    permission: string,
    actorId: string,
    actorEmail: string
  ): Promise<IUserOrganizationWithId> {
    // Check if user belongs to this organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('organizationId', '==', organizationId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`User ${userId} is not an active member of organization ${organizationId}`);
    }
    
    const userOrg = userOrgSnapshot.docs[0].data();
    
    // Get current permissions
    const permissions = userOrg.permissions || {};
    const restrictedPermissions = permissions.restrictedPermissions || [];
    
    // Check if restriction exists
    if (!restrictedPermissions.includes(permission)) {
      return userOrg; // Restriction not found
    }
    
    // Remove restriction from the list
    const updatedRestrictedPermissions = restrictedPermissions.filter(p => p !== permission);
    
    // Update user-organization
    return await this.updateUserOrganization(
      (userOrg as any).id,
      {
        permissions: {
          ...permissions,
          restrictedPermissions: updatedRestrictedPermissions
        }
      },
      actorId,
      actorEmail
    );
  }
}
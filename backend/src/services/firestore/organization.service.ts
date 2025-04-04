/**
 * Organization Service
 * Handles operations related to organizations in Firestore
 */
import { Timestamp } from 'firebase-admin/firestore';
import {
  organizationsCollection,
  userOrganizationsCollection,
  auditLogsCollection,
  rolesCollection
} from '../../config/firestore';
import {
  IOrganization,
  IOrganizationWithId,
  OrganizationType,
  OrganizationStatus,
  organizationConverter,
  IUserOrganization,
  MembershipStatus,
  MembershipType,
  userOrganizationConverter,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter,
  RoleScope,
  systemRoles
} from '../../models/firestore';

/**
 * Service for organization management
 */
export class OrganizationService {
  /**
   * Create a new organization
   * @param name Organization name
   * @param ownerId User ID of the organization owner
   * @param orgType Organization type
   * @param parentId Optional parent organization ID (for hierarchy)
   * @returns Created organization with ID
   */
  async createOrganization(
    name: string,
    ownerId: string,
    ownerEmail: string,
    orgType: OrganizationType = OrganizationType.BASIC,
    parentId?: string
  ): Promise<IOrganizationWithId> {
    // Get the current timestamp
    const now = Timestamp.now();
    
    // Create organization data
    const organization: IOrganization = {
      name,
      type: orgType,
      status: OrganizationStatus.ACTIVE,
      ownerId,
      createdAt: now,
      updatedAt: now,
      settings: {
        allowSuborganizations: 
          orgType === OrganizationType.ENTERPRISE || 
          orgType === OrganizationType.AGENCY,
        maxUsers: this.getMaxUsersByType(orgType),
        maxSuborganizations: this.getMaxSubOrgsByType(orgType),
        defaultUserRole: 'member'
      }
    };
    
    // If this is a child organization, set up hierarchy data
    if (parentId) {
      const parentOrg = await this.getOrganizationById(parentId);
      if (!parentOrg) {
        throw new Error(`Parent organization ${parentId} not found`);
      }
      
      // Check if parent allows suborganizations
      if (!parentOrg.settings?.allowSuborganizations) {
        throw new Error(`Organization ${parentId} does not allow suborganizations`);
      }
      
      // Set hierarchy data
      organization.parentId = parentId;
      organization.rootId = parentOrg.rootId || parentId;
      
      // Create path array - represents the hierarchy path from root to this org
      const parentPath = parentOrg.path || [parentId];
      organization.path = [...parentPath, parentId];
    } else {
      // This is a root organization, so it will be its own rootId
      // Path will be created when we get the document ID below
    }

    // Create the organization in Firestore
    const orgRef = organizationsCollection.withConverter(organizationConverter).doc();
    const orgId = orgRef.id;
    
    // If this is a root organization, set path now that we have the ID
    if (!parentId) {
      organization.path = [orgId];
    }
    
    // Add the organization to Firestore
    await orgRef.set(organization);
    
    // Create user-organization relationship for the owner
    const userOrg: IUserOrganization = {
      userId: ownerId,
      organizationId: orgId,
      status: MembershipStatus.ACTIVE,
      type: MembershipType.OWNER,
      roles: ['organization-owner'], // Default owner role
      isDefault: true, // Set as default organization for the owner
      joinedAt: now,
      createdAt: now,
      updatedAt: now
    };
    
    await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .doc()
      .set(userOrg);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      ownerId,
      ownerEmail,
      orgId,
      AuditCategory.ORGANIZATION,
      AuditAction.CREATE,
      'organization',
      `Organization "${name}" created`,
      {
        resourceId: orgId,
        severity: AuditSeverity.INFO,
        metadata: {
          organizationType: orgType,
          parentId
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Get the created organization
    const snapshot = await orgRef.get();
    return snapshot.data() as IOrganizationWithId;
  }
  
  /**
   * Get organization by ID
   * @param id Organization ID
   * @returns Organization or null if not found
   */
  async getOrganizationById(id: string): Promise<IOrganizationWithId | null> {
    const snapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .doc(id)
      .get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as IOrganizationWithId;
  }
  
  /**
   * Update an organization
   * @param id Organization ID
   * @param data Update data
   * @param userId User ID performing the update
   * @param userEmail User email performing the update
   * @returns Updated organization
   */
  async updateOrganization(
    id: string,
    data: Partial<IOrganization>,
    userId: string,
    userEmail: string
  ): Promise<IOrganizationWithId> {
    // Get the organization to check if it exists
    const org = await this.getOrganizationById(id);
    if (!org) {
      throw new Error(`Organization ${id} not found`);
    }
    
    // Remove immutable fields from update data
    const {
      createdAt, updatedAt, rootId, path, ownerId, parentId, ...updateData
    } = data as any;
    
    // Set the updatedAt timestamp
    updateData.updatedAt = Timestamp.now();
    
    // Update the organization
    await organizationsCollection
      .withConverter(organizationConverter)
      .doc(id)
      .update(updateData);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      userId,
      userEmail,
      id,
      AuditCategory.ORGANIZATION,
      AuditAction.UPDATE,
      'organization',
      `Organization "${org.name}" updated`,
      {
        resourceId: id,
        severity: AuditSeverity.INFO,
        metadata: {
          before: org,
          after: { ...org, ...updateData }
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Get the updated organization
    const snapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .doc(id)
      .get();
    
    return snapshot.data() as IOrganizationWithId;
  }
  
  /**
   * Delete an organization
   * @param id Organization ID
   * @param userId User ID performing the delete
   * @param userEmail User email performing the delete
   * @returns Success boolean
   */
  async deleteOrganization(
    id: string,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    // Get the organization to check if it exists
    const org = await this.getOrganizationById(id);
    if (!org) {
      throw new Error(`Organization ${id} not found`);
    }
    
    // Check if organization has child organizations
    const childrenSnapshot = await organizationsCollection
      .where('parentId', '==', id)
      .limit(1)
      .get();
    
    if (!childrenSnapshot.empty) {
      throw new Error(`Cannot delete organization with child organizations`);
    }
    
    // Create audit log entry before deletion
    const auditLog = createAuditLog(
      userId,
      userEmail,
      id,
      AuditCategory.ORGANIZATION,
      AuditAction.DELETE,
      'organization',
      `Organization "${org.name}" deleted`,
      {
        resourceId: id,
        severity: AuditSeverity.ALERT,
        metadata: {
          organization: org
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Delete related user-organization memberships
    const userOrgsSnapshot = await userOrganizationsCollection
      .where('organizationId', '==', id)
      .get();
    
    const batch = userOrganizationsCollection.firestore.batch();
    userOrgsSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    
    // Delete the organization
    batch.delete(organizationsCollection.doc(id));
    
    // Commit the batch
    await batch.commit();
    
    return true;
  }
  
  /**
   * Get user's organizations
   * @param userId User ID
   * @returns Array of organizations the user belongs to
   */
  async getUserOrganizations(userId: string): Promise<IOrganizationWithId[]> {
    // Get user-organization relationships for this user
    const userOrgsSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', userId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .get();
    
    if (userOrgsSnapshot.empty) {
      return [];
    }
    
    // Get organization IDs
    const orgIds = userOrgsSnapshot.docs.map((doc: any) => doc.data().organizationId);
    
    // Get organizations
    const organizations: IOrganizationWithId[] = [];
    
    for (const orgId of orgIds) {
      const org = await this.getOrganizationById(orgId);
      if (org) {
        organizations.push(org);
      }
    }
    
    return organizations;
  }
  
  /**
   * Get child organizations for a parent organization
   * @param parentId Parent organization ID
   * @returns Array of child organizations
   */
  async getChildOrganizations(parentId: string): Promise<IOrganizationWithId[]> {
    const snapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .where('parentId', '==', parentId)
      .get();
    
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get organizations by type
   * @param type Organization type
   * @returns Array of organizations of the specified type
   */
  async getOrganizationsByType(type: OrganizationType): Promise<IOrganizationWithId[]> {
    const snapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .where('type', '==', type)
      .get();
    
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Change organization owner
   * @param orgId Organization ID
   * @param newOwnerId New owner user ID
   * @param actorId User ID performing the change
   * @param actorEmail User email performing the change
   * @returns Updated organization
   */
  async changeOrganizationOwner(
    orgId: string,
    newOwnerId: string,
    actorId: string,
    actorEmail: string
  ): Promise<IOrganizationWithId> {
    // Get the organization
    const org = await this.getOrganizationById(orgId);
    if (!org) {
      throw new Error(`Organization ${orgId} not found`);
    }
    
    // Check if new owner is a member of the organization
    const userOrgSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', newOwnerId)
      .where('organizationId', '==', orgId)
      .where('status', '==', MembershipStatus.ACTIVE)
      .limit(1)
      .get();
    
    if (userOrgSnapshot.empty) {
      throw new Error(`New owner is not a member of the organization`);
    }
    
    // Get the current owner's user-organization document
    const currentOwnerSnapshot = await userOrganizationsCollection
      .withConverter(userOrganizationConverter)
      .where('userId', '==', org.ownerId)
      .where('organizationId', '==', orgId)
      .where('type', '==', MembershipType.OWNER)
      .limit(1)
      .get();
    
    // Get the new owner's user-organization document
    const newOwnerUserOrgRef = userOrgSnapshot.docs[0].ref;
    const newOwnerUserOrg = userOrgSnapshot.docs[0].data();
    
    // Update the organization with the new owner
    await organizationsCollection
      .withConverter(organizationConverter)
      .doc(orgId)
      .update({
        ownerId: newOwnerId,
        updatedAt: Timestamp.now()
      });
    
    // Update the new owner's user-organization document
    await newOwnerUserOrgRef.update({
      type: MembershipType.OWNER,
      roles: ['organization-owner'], // Set owner role
      updatedAt: Timestamp.now()
    });
    
    // Update the previous owner's membership type
    if (!currentOwnerSnapshot.empty) {
      await currentOwnerSnapshot.docs[0].ref.update({
        type: MembershipType.MEMBER,
        updatedAt: Timestamp.now()
      });
    }
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      orgId,
      AuditCategory.ORGANIZATION,
      AuditAction.UPDATE,
      'organization',
      `Organization ownership changed from ${org.ownerId} to ${newOwnerId}`,
      {
        resourceId: orgId,
        severity: AuditSeverity.ALERT,
        metadata: {
          previousOwnerId: org.ownerId,
          newOwnerId
        }
      }
    );
    
    await auditLogsCollection
      .withConverter(auditLogConverter)
      .doc()
      .set(auditLog);
    
    // Get the updated organization
    return await this.getOrganizationById(orgId) as IOrganizationWithId;
  }
  
  /**
   * Create default roles for a new organization
   * @param orgId Organization ID
   */
  async createDefaultRoles(orgId: string): Promise<void> {
    const now = Timestamp.now();
    const batch = rolesCollection.firestore.batch();
    
    // Create organization-specific versions of system roles
    for (const role of systemRoles) {
      if (role.scope === RoleScope.SYSTEM) {
        // Create an organization-specific copy of this role
        const orgRole = {
          ...role,
          scope: RoleScope.ORGANIZATION,
          organizationId: orgId,
          createdAt: now,
          updatedAt: now
        };
        
        // Generate document ID based on role name for easy reference
        const roleId = `${orgId}-${role.name.toLowerCase().replace(/\s+/g, '-')}`;
        const roleRef = rolesCollection.doc(roleId);
        
        batch.set(roleRef, orgRole);
      }
    }
    
    // Commit the batch
    await batch.commit();
  }
  
  /**
   * Get max users based on organization type
   * @param orgType Organization type
   * @returns Max number of users
   */
  private getMaxUsersByType(orgType: OrganizationType): number {
    switch (orgType) {
      case OrganizationType.BASIC:
        return 5;
      case OrganizationType.PROFESSIONAL:
        return 20;
      case OrganizationType.ENTERPRISE:
        return 100;
      case OrganizationType.AGENCY:
        return 50;
      default:
        return 5;
    }
  }
  
  /**
   * Get max suborganizations based on organization type
   * @param orgType Organization type
   * @returns Max number of suborganizations
   */
  private getMaxSubOrgsByType(orgType: OrganizationType): number {
    switch (orgType) {
      case OrganizationType.BASIC:
        return 0;
      case OrganizationType.PROFESSIONAL:
        return 0;
      case OrganizationType.ENTERPRISE:
        return 10;
      case OrganizationType.AGENCY:
        return 50;
      default:
        return 0;
    }
  }
}
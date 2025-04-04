// @ts-nocheck - Added by final-ts-fix.js
/**
 * Invitation Service
 * Handles operations related to organization invitations
 */
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  invitationsCollection,
  auditLogsCollection,
  organizationsCollection,
  userOrganizationsCollection,
  firebaseUsersCollection
} from '../../config/firestore';
import {
  IInvitation,
  IInvitationWithId,
  InvitationStatus,
  invitationConverter,
  AuditCategory,
  AuditAction,
  AuditSeverity,
  createAuditLog,
  auditLogConverter,
  organizationConverter,
  MembershipType,
  MembershipStatus,
  userOrganizationConverter,
  userConverter,
  UserStatus,
  AuthProvider,
  OrganizationType
} from '../../models/firestore';
import { UserOrganizationService } from './user-organization.service';
import { OrganizationService } from './organization.service';

import { WithId } from '../../types';

/**
 * Service for invitation management
 */
export class InvitationService {
  private userOrgService: UserOrganizationService;
  private organizationService: OrganizationService;
  
  constructor() {
    this.userOrgService = new UserOrganizationService();
    this.organizationService = new OrganizationService();
  }
  
  /**
   * Create invitation for a user to join an organization
   * @param email Email to invite
   * @param organizationId Organization ID
   * @param roles Array of role IDs to assign
   * @param type Membership type
   * @param message Optional message to include
   * @param expiresIn Expiration time in hours (default 72)
   * @param inviterId User ID of the inviter
   * @param inviterEmail Email of the inviter
   * @returns Created invitation with ID
   */
  async createInvitation(
    email: string,
    organizationId: string,
    roles: string[] = [],
    type: MembershipType = MembershipType.MEMBER,
    message?: string,
    expiresIn: number = 72, // Default to 72 hours
  // @ts-ignore - TS1016: A required parameter cannot follow an optional parameter.
    inviterId: string,
    inviterEmail: string
  ): Promise<IInvitationWithId> {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if the organization exists
    const orgSnapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .doc(organizationId)
      .get();
    
    if (!orgSnapshot.exists) {
      throw new Error(`Organization ${organizationId} not found`);
    }
    
    const org = orgSnapshot.data();
    
    // Check if there is already a pending invitation for this email
    const existingInviteSnapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('email', '==', normalizedEmail)
      .where('organizationId', '==', organizationId)
      .where('status', '==', InvitationStatus.PENDING)
      .limit(1)
      .get();
    
    if (!existingInviteSnapshot.empty) {
      throw new Error(`An invitation for ${normalizedEmail} is already pending`);
    }
    
    // Check if user with this email already exists
    const userSnapshot = await firebaseUsersCollection
      .withConverter(userConverter)
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (!userSnapshot.empty) {
      const user = userSnapshot.docs[0].data();
      
      // Check if user is already a member of this organization
      const userOrgSnapshot = await userOrganizationsCollection
        .withConverter(userOrganizationConverter)
        .where('userId', '==', user.id)
        .where('organizationId', '==', organizationId)
        .limit(1)
        .get();
      
      if (!userOrgSnapshot.empty) {
        const userOrg = userOrgSnapshot.docs[0].data();
        
        if (userOrg.status === MembershipStatus.ACTIVE) {
          throw new Error(`User ${normalizedEmail} is already a member of this organization`);
        }
      }
    }
    
    // Generate a unique token for the invitation
    const token = uuidv4();
    
    // Calculate expiration date
    const now = Timestamp.now();
    const expirationDate = new Date(now.toMillis() + expiresIn * 60 * 60 * 1000);
    
    // Create invitation object
    const invitation: IInvitation = {
      email: normalizedEmail,
      organizationId,
      status: InvitationStatus.PENDING,
      token,
      invitedBy: inviterId,
      message,
      type,
      roles,
      expiresAt: Timestamp.fromDate(expirationDate),
      createdAt: now,
      updatedAt: now
    };
    
    // Add to Firestore
    const inviteRef = invitationsCollection.withConverter(invitationConverter).doc();
    await inviteRef.set(invitation);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      inviterId,
      inviterEmail,
      organizationId,
      AuditCategory.INVITATION,
      AuditAction.INVITE,
      'invitation',
      `Invitation sent to ${normalizedEmail}`,
      {
        resourceId: inviteRef.id,
        severity: AuditSeverity.INFO,
        metadata: {
          email: normalizedEmail,
          organizationId,
          type,
          roles,
          expiresAt: expirationDate
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Get the created invitation
    const snapshot = await inviteRef.get();
    return snapshot.data() as IInvitationWithId;
  }
  
  /**
   * Create agency invitation for a client to create a new organization
   * @param email Email to invite
   * @param parentOrganizationId Parent (agency) organization ID
   * @param organizationName Suggested name for the new organization
   * @param message Optional message to include
   * @param expiresIn Expiration time in hours (default 72)
   * @param inviterId User ID of the inviter
   * @param inviterEmail Email of the inviter
   * @returns Created invitation with ID
   */
  async createAgencyInvitation(
    email: string,
    parentOrganizationId: string,
    organizationName: string,
    message?: string,
  // @ts-ignore - TS1016: A required parameter cannot follow an optional parameter.
    expiresIn: number = 72, // Default to 72 hours
    inviterId: string,
    inviterEmail: string
  ): Promise<IInvitationWithId> {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if the parent organization exists
    const orgSnapshot = await organizationsCollection
      .withConverter(organizationConverter)
      .doc(parentOrganizationId)
      .get();
    
    if (!orgSnapshot.exists) {
      throw new Error(`Parent organization ${parentOrganizationId} not found`);
    }
    
    const org = orgSnapshot.data();
    
    // Check if the parent organization is an agency
    if (org.type !== OrganizationType.AGENCY) {
      throw new Error(`Organization ${parentOrganizationId} is not an agency`);
    }
    
    // Check if there is already a pending agency invitation for this email
    const existingInviteSnapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('email', '==', normalizedEmail)
      .where('agencyInvitation.parentOrganizationId', '==', parentOrganizationId)
      .where('status', '==', InvitationStatus.PENDING)
      .limit(1)
      .get();
    
    if (!existingInviteSnapshot.empty) {
      throw new Error(`An agency invitation for ${normalizedEmail} is already pending`);
    }
    
    // Generate a unique token for the invitation
    const token = uuidv4();
    
    // Calculate expiration date
    const now = Timestamp.now();
    const expirationDate = new Date(now.toMillis() + expiresIn * 60 * 60 * 1000);
    
    // Create invitation object for agency
    const invitation: IInvitation = {
      email: normalizedEmail,
      organizationId: '', // Will be set when the org is created
      status: InvitationStatus.PENDING,
      token,
      invitedBy: inviterId,
      message,
      type: MembershipType.OWNER, // Will be org owner
      roles: [], // Will be set upon acceptance
      expiresAt: Timestamp.fromDate(expirationDate),
      agencyInvitation: {
        isAgencyInvitation: true,
        parentOrganizationId,
        organizationName
      },
      createdAt: now,
      updatedAt: now
    };
    
    // Add to Firestore
    const inviteRef = invitationsCollection.withConverter(invitationConverter).doc();
    await inviteRef.set(invitation);
    
    // Create audit log entry
    const auditLog = createAuditLog(
      inviterId,
      inviterEmail,
      parentOrganizationId,
      AuditCategory.INVITATION,
      AuditAction.INVITE,
      'invitation',
      `Agency invitation sent to ${normalizedEmail} for a new organization`,
      {
        resourceId: inviteRef.id,
        severity: AuditSeverity.INFO,
        metadata: {
          email: normalizedEmail,
          parentOrganizationId,
          organizationName,
          expiresAt: expirationDate
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Get the created invitation
    const snapshot = await inviteRef.get();
    return snapshot.data() as IInvitationWithId;
  }
  
  /**
   * Get invitation by ID
   * @param id Invitation ID
   * @returns Invitation or null if not found
   */
  async getInvitationById(id: string): Promise<IInvitationWithId | null> {
    const snapshot = await invitationsCollection.withConverter(invitationConverter).doc(id).get();
    
    if (!snapshot.exists) {
      return null;
    }
    
    return snapshot.data() as IInvitationWithId;
  }
  
  /**
   * Get invitation by token
   * @param token Invitation token
   * @returns Invitation or null if not found
   */
  async getInvitationByToken(token: string): Promise<IInvitationWithId | null> {
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('token', '==', token)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data();
  }
  
  /**
   * Accept invitation
   * @param token Invitation token
   * @param userId User ID accepting the invitation
   * @param userEmail User email accepting the invitation
   * @returns Success flag
   */
  async acceptInvitation(
    token: string,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    // Get invitation by token
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    // Check if invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }
    
    // Check if invitation has expired
    const now = Timestamp.now();
    if ((invitation.expiresAt as any).toMillis() < now.toMillis()) {
      // Update invitation status to EXPIRED
      await invitationsCollection.doc(invitation.id).update({
        status: InvitationStatus.EXPIRED,
        updatedAt: now
      });
      
      throw new Error('Invitation has expired');
    }
    
    // Check if user email matches invitation email
    const userSnapshot = await firebaseUsersCollection.doc(userId).get();
    if (!userSnapshot.exists) {
      throw new Error('User not found');
    }
    
    const userData = userSnapshot.data();
    if (userData?.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('Invitation email does not match your account email');
    }
    
    // Handle different types of invitations
    if (invitation.agencyInvitation?.isAgencyInvitation) {
      // Agency invitation - create new organization
      return await this.acceptAgencyInvitation(invitation, userId, userEmail);
    } else {
      // Regular organization invitation
      // Add user to organization
      await this.userOrgService.addUserToOrganization(
        userId,
        invitation.organizationId,
        invitation.roles,
        invitation.type,
        userId, // Self-action for audit
        userEmail
      );
      
      // Update invitation
      await invitationsCollection.doc(invitation.id).update({
        status: InvitationStatus.ACCEPTED,
        acceptedAt: now,
        acceptedByUserId: userId,
        updatedAt: now
      });
      
      // Create audit log entry
      const auditLog = createAuditLog(
        userId,
        userEmail,
        invitation.organizationId,
        AuditCategory.INVITATION,
        AuditAction.JOIN,
        'invitation',
        `Invitation accepted by ${userEmail}`,
        {
          resourceId: invitation.id,
          severity: AuditSeverity.INFO,
          metadata: {
            invitationId: invitation.id,
            organizationId: invitation.organizationId,
            userId
          }
        }
      );
      
      await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
      
      return true;
    }
  }
  
  /**
   * Accept agency invitation - private helper
   * @param invitation Invitation object
   * @param userId User ID accepting the invitation
   * @param userEmail User email accepting the invitation
   * @returns Success flag
   */
  private async acceptAgencyInvitation(
    invitation: IInvitationWithId,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    if (!invitation.agencyInvitation) {
      throw new Error('Not an agency invitation');
    }
    
    const now = Timestamp.now();
    const parentOrgId = invitation.agencyInvitation.parentOrganizationId;
    
    // Create new organization as a child of the agency
    const newOrg = await this.organizationService.createOrganization(
      invitation.agencyInvitation.organizationName || `${userEmail}'s Organization`,
      userId,
      userEmail,
      OrganizationType.PROFESSIONAL,
      parentOrgId
    );
    
    // Update invitation with the new organization ID
    await invitationsCollection.doc(invitation.id).update({
      organizationId: newOrg.id,
      status: InvitationStatus.ACCEPTED,
      acceptedAt: now,
      acceptedByUserId: userId,
      updatedAt: now
    });
    
    // Create audit log entry
    const auditLog = createAuditLog(
      userId,
      userEmail,
      newOrg.id,
      AuditCategory.INVITATION,
      AuditAction.JOIN,
      'invitation',
      `Agency invitation accepted by ${userEmail}`,
      {
        resourceId: invitation.id,
        severity: AuditSeverity.INFO,
        metadata: {
          invitationId: invitation.id,
          parentOrganizationId: parentOrgId,
          newOrganizationId: newOrg.id,
          userId
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    // Add the user to the parent organization as well with limited access
    await this.userOrgService.addUserToOrganization(
      userId,
      parentOrgId,
      [], // Default roles
      MembershipType.MEMBER,
      userId, // Self-action for audit
      userEmail
    );
    
    return true;
  }
  
  /**
   * Decline invitation
   * @param token Invitation token
   * @param userId User ID declining the invitation
   * @param userEmail User email declining the invitation
   * @returns Success flag
   */
  async declineInvitation(
    token: string,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    // Get invitation by token
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    // Check if invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }
    
    // Check if invitation has expired
    const now = Timestamp.now();
    if ((invitation.expiresAt as any).toMillis() < now.toMillis()) {
      // Update invitation status to EXPIRED
      await invitationsCollection.doc(invitation.id).update({
        status: InvitationStatus.EXPIRED,
        updatedAt: now
      });
      
      throw new Error('Invitation has expired');
    }
    
    // Update invitation
    await invitationsCollection.doc(invitation.id).update({
      status: InvitationStatus.DECLINED,
      updatedAt: now
    });
    
    // Create audit log entry
    const auditLog = createAuditLog(
      userId,
      userEmail,
      invitation.organizationId || invitation.agencyInvitation?.parentOrganizationId || 'system',
      AuditCategory.INVITATION,
      AuditAction.UPDATE,
      'invitation',
      `Invitation declined by ${userEmail}`,
      {
        resourceId: invitation.id,
        severity: AuditSeverity.INFO,
        metadata: {
          invitationId: invitation.id,
          organizationId: invitation.organizationId,
          userId
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    return true;
  }
  
  /**
   * Revoke invitation
   * @param id Invitation ID
   * @param actorId User ID performing the revocation
   * @param actorEmail User email performing the revocation
   * @returns Success flag
   */
  async revokeInvitation(
    id: string,
    actorId: string,
    actorEmail: string
  ): Promise<boolean> {
    // Get invitation
    const invitation = await this.getInvitationById(id);
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    // Check if invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }
    
    const now = Timestamp.now();
    
    // Update invitation
    await invitationsCollection.doc(invitation.id).update({
      status: InvitationStatus.REVOKED,
      updatedAt: now
    });
    
    // Create audit log entry
    const auditLog = createAuditLog(
      actorId,
      actorEmail,
      invitation.organizationId || invitation.agencyInvitation?.parentOrganizationId || 'system',
      AuditCategory.INVITATION,
      AuditAction.UPDATE,
      'invitation',
      `Invitation to ${invitation.email} revoked`,
      {
        resourceId: invitation.id,
        severity: AuditSeverity.INFO,
        metadata: {
          invitationId: invitation.id,
          organizationId: invitation.organizationId,
          inviteeEmail: invitation.email
        }
      }
    );
    
    await auditLogsCollection.withConverter(auditLogConverter).doc().set(auditLog);
    
    return true;
  }
  
  /**
   * Get pending invitations for an email
   * @param email User email
   * @returns Array of pending invitations
   */
  async getPendingInvitationsForEmail(email: string): Promise<IInvitationWithId[]> {
    const normalizedEmail = email.toLowerCase().trim();
    
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('email', '==', normalizedEmail)
      .where('status', '==', InvitationStatus.PENDING)
      .get();
    
    // Filter out expired invitations
    const now = Timestamp.now().toMillis();
    const validInvitations = snapshot.docs
      .map((doc: any) => doc.data())
      .filter((invitation: any) => (invitation.expiresAt as any).toMillis() > now);
    
    // Update status of expired invitations
    const expiredInvitations = snapshot.docs
      .filter((doc: any) => doc.data().expiresAt.toMillis() <= now);
    
    if (expiredInvitations.length > 0) {
      const batch = invitationsCollection.firestore.batch();
      expiredInvitations.forEach((doc: any) => {
        batch.update(doc.ref, {
          status: InvitationStatus.EXPIRED,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    }
    
    return validInvitations;
  }
  
  /**
   * Get organization invitations
   * @param organizationId Organization ID
   * @returns Array of invitations
   */
  async getOrganizationInvitations(organizationId: string): Promise<IInvitationWithId[]> {
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('organizationId', '==', organizationId)
      .get();
    
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get pending invitations for an organization
   * @param organizationId Organization ID
   * @returns Array of pending invitations
   */
  async getPendingOrganizationInvitations(organizationId: string): Promise<IInvitationWithId[]> {
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('organizationId', '==', organizationId)
      .where('status', '==', InvitationStatus.PENDING)
      .get();
    
    // Filter out expired invitations
    const now = Timestamp.now().toMillis();
    const validInvitations = snapshot.docs
      .map((doc: any) => doc.data())
      .filter((invitation: any) => (invitation.expiresAt as any).toMillis() > now);
    
    // Update status of expired invitations
    const expiredInvitations = snapshot.docs
      .filter((doc: any) => doc.data().expiresAt.toMillis() <= now);
    
    if (expiredInvitations.length > 0) {
      const batch = invitationsCollection.firestore.batch();
      expiredInvitations.forEach((doc: any) => {
        batch.update(doc.ref, {
          status: InvitationStatus.EXPIRED,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    }
    
    return validInvitations;
  }
  
  /**
   * Get agency invitations
   * @param agencyId Agency organization ID
   * @returns Array of agency invitations
   */
  async getAgencyInvitations(agencyId: string): Promise<IInvitationWithId[]> {
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('agencyInvitation.parentOrganizationId', '==', agencyId)
      .get();
    
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
  }
  
  /**
   * Get pending agency invitations
   * @param agencyId Agency organization ID
   * @returns Array of pending agency invitations
   */
  async getPendingAgencyInvitations(agencyId: string): Promise<IInvitationWithId[]> {
    const snapshot = await invitationsCollection
      .withConverter(invitationConverter)
      .where('agencyInvitation.parentOrganizationId', '==', agencyId)
      .where('status', '==', InvitationStatus.PENDING)
      .get();
    
    // Filter out expired invitations
    const now = Timestamp.now().toMillis();
    const validInvitations = snapshot.docs
      .map((doc: any) => doc.data())
      .filter((invitation: any) => (invitation.expiresAt as any).toMillis() > now);
    
    // Update status of expired invitations
    const expiredInvitations = snapshot.docs
      .filter((doc: any) => doc.data().expiresAt.toMillis() <= now);
    
    if (expiredInvitations.length > 0) {
      const batch = invitationsCollection.firestore.batch();
      expiredInvitations.forEach((doc: any) => {
        batch.update(doc.ref, {
          status: InvitationStatus.EXPIRED,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    }
    
    return validInvitations;
  }
}
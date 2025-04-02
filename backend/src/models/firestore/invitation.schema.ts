/**
 * Invitation schema for multi-account user provisioning
 * Using Firestore data model
 */
import { Timestamp } from 'firebase-admin/firestore';
import { MembershipType } from './user-organization.schema';

/**
 * Invitation status types
 */
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

/**
 * Interface for Invitation
 */
export interface IInvitation {
  email: string;
  organizationId: string;
  status: InvitationStatus;
  type: MembershipType;
  roles: string[]; // Array of role IDs
  token: string;
  invitedBy: string; // User ID who created this invitation
  message?: string; // Optional message from inviter
  expiresAt: Date | Timestamp;
  acceptedAt?: Date | Timestamp;
  acceptedByUserId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  // For agencies inviting clients to create organizations
  agencyInvitation?: {
    isAgencyInvitation: boolean;
    parentOrganizationId: string;
    organizationName?: string;
    organizationType?: string;
  };
}

/**
 * Invitation with ID field
 */
export interface IInvitationWithId extends IInvitation {
  id: string; // Document ID
}

/**
 * Converter for Firestore
 */
export const invitationConverter = {
  toFirestore(invitation: IInvitation): FirebaseFirestore.DocumentData {
    // Ensure timestamps are correct
    const now = Timestamp.now();
    return {
      email: invitation.email.toLowerCase(),
      organizationId: invitation.organizationId,
      status: invitation.status,
      type: invitation.type,
      roles: invitation.roles || [],
      token: invitation.token,
      invitedBy: invitation.invitedBy,
      message: invitation.message,
      expiresAt: invitation.expiresAt instanceof Date 
        ? Timestamp.fromDate(invitation.expiresAt) 
        : invitation.expiresAt,
      acceptedAt: invitation.acceptedAt instanceof Date 
        ? Timestamp.fromDate(invitation.acceptedAt) 
        : invitation.acceptedAt,
      acceptedByUserId: invitation.acceptedByUserId,
      agencyInvitation: invitation.agencyInvitation,
      createdAt: invitation.createdAt instanceof Date 
        ? Timestamp.fromDate(invitation.createdAt) 
        : invitation.createdAt || now,
      updatedAt: now
    };
  },
  
  fromFirestore(
    snapshot: FirebaseFirestore.QueryDocumentSnapshot
  ): IInvitationWithId {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      organizationId: data.organizationId,
      status: data.status,
      type: data.type,
      roles: data.roles,
      token: data.token,
      invitedBy: data.invitedBy,
      message: data.message,
      expiresAt: data.expiresAt,
      acceptedAt: data.acceptedAt,
      acceptedByUserId: data.acceptedByUserId,
      agencyInvitation: data.agencyInvitation,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as IInvitationWithId;
  }
};
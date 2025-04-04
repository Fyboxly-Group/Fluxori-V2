import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { injectable, inject } from 'inversify';
import { ApiError } from '../middleware/error.middleware';
import Organization, { 
  IOrganization, 
  IOrganizationDocument,
  OrganizationStatus,
  OrganizationTier,
  IOrganizationAddress,
  IContactPerson
} from '../models/organization.model';
import Activity from '../models/activity.model';
import User from '../models/user.model';
import { LoggerService } from './logger.service';
import 'reflect-metadata';

/**
 * Interface for organization query options
 */
export interface OrganizationQueryOptions {
  limit?: number;
  page?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tier?: OrganizationTier;
}

/**
 * Interface for organization list result
 */
export interface OrganizationListResult {
  items: IOrganizationDocument[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface for organization member
 */
export interface OrganizationMember {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  joinedAt?: Date;
}

/**
 * Interface for organization invitation
 */
export interface OrganizationInvitation {
  email: string;
  role: string;
  message?: string;
  expiresAt?: Date;
}

/**
 * Service interface for dependency injection
 */
export interface IOrganizationService {
  getAll(options: OrganizationQueryOptions): Promise<OrganizationListResult>;
  getById(id: string): Promise<IOrganizationDocument>;
  getBySlug(slug: string): Promise<IOrganizationDocument>;
  create(data: Partial<IOrganization>, userId: string): Promise<IOrganizationDocument>;
  update(id: string, data: Partial<IOrganization>): Promise<IOrganizationDocument>;
  updateStatus(id: string, status: OrganizationStatus): Promise<IOrganizationDocument>;
  updateTier(id: string, tier: OrganizationTier): Promise<IOrganizationDocument>;
  addAddress(id: string, address: IOrganizationAddress): Promise<IOrganizationDocument>;
  updateAddress(id: string, addressIndex: number, address: Partial<IOrganizationAddress>): Promise<IOrganizationDocument>;
  removeAddress(id: string, addressIndex: number): Promise<IOrganizationDocument>;
  setMainContact(id: string, contact: IContactPerson): Promise<IOrganizationDocument>;
  addContact(id: string, contact: IContactPerson): Promise<IOrganizationDocument>;
  removeContact(id: string, email: string): Promise<IOrganizationDocument>;
  getMembers(id: string): Promise<OrganizationMember[]>;
  inviteMember(id: string, invitation: OrganizationInvitation, invitedBy: string): Promise<any>;
  delete(id: string): Promise<boolean>;
}

/**
 * Organization Service
 * Handles business logic for organization operations
 */
@injectable()
export class OrganizationService implements IOrganizationService {
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {}

  /**
   * Get all organizations with pagination and filtering
   */
  async getAll(
    options: OrganizationQueryOptions = {}
  ): Promise<OrganizationListResult> {
    try {
      const {
        limit = 10,
        page = 1,
        status,
        sortBy = 'name',
        sortOrder = 'asc',
        search = '',
        tier
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query filters
      const query: any = {};

      // Add status filter if specified
      if (status && status !== 'all') {
        query.status = status;
      }

      // Add tier filter if specified
      if (tier) {
        query['billingDetails.tier'] = tier;
      }

      // Add search filter if specified
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
          { 'mainContactPerson.email': { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const items = await Organization
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await Organization.countDocuments(query);

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      this.logger.error('Error in OrganizationService.getAll', { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Find organization
      const organization = await Organization.findById(id);

      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.getById', { 
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get organization by slug
   */
  async getBySlug(slug: string): Promise<IOrganizationDocument> {
    try {
      // Find organization by slug
      const organization = await Organization.findBySlug(slug);

      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.getBySlug', { 
        error: error instanceof Error ? error.message : String(error),
        slug
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Create a new organization
   */
  async create(
    data: Partial<IOrganization>, 
    userId: string
  ): Promise<IOrganizationDocument> {
    try {
      // Validate the user exists
      if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user ID format');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
      }

      // Check if name is provided
      if (!data.name || data.name.trim().length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Organization name is required');
      }

      // Create using static method for defaults
      const newOrganization = await Organization.createWithDefaults(
        data,
        userId
      );
      
      // Log activity
      await Activity.create({
        type: 'organization_created',
        description: `Organization "${newOrganization.name}" created`,
        entityType: 'organization',
        entityId: newOrganization._id,
        userId: new mongoose.Types.ObjectId(userId),
        organizationId: newOrganization._id
      });
      
      this.logger.info('Created new organization', {
        organizationId: newOrganization._id,
        name: newOrganization.name,
        createdBy: userId
      });
      
      return newOrganization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.create', { 
        error: error instanceof Error ? error.message : String(error),
        data,
        userId
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update organization by ID
   */
  async update(
    id: string, 
    data: Partial<IOrganization>
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Check if organization exists
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Remove fields that shouldn't be updated directly
      delete data.createdBy;
      delete data.slug; // Slug should be generated, not manually set
      delete data.status; // Status should be updated via updateStatus method
      delete data.billingDetails?.tier; // Tier should be updated via updateTier method
      delete data.creditBalance; // Credit balance should be managed separately
      
      // Update organization
      const updatedOrganization = await Organization.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedOrganization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Generate slug if name was updated and slug doesn't exist
      if (data.name && !updatedOrganization.slug) {
        await updatedOrganization.generateSlug();
        await updatedOrganization.save();
      }

      this.logger.info('Updated organization', {
        organizationId: id,
        name: updatedOrganization.name
      });
      
      return updatedOrganization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.update', { 
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update organization status
   */
  async updateStatus(
    id: string, 
    status: OrganizationStatus
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Check if valid status
      if (!Object.values(OrganizationStatus).includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization status');
      }

      // Update status
      const updatedOrganization = await Organization.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
      );

      if (!updatedOrganization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      this.logger.info('Updated organization status', {
        organizationId: id,
        status
      });
      
      return updatedOrganization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.updateStatus', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        status
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update organization tier
   */
  async updateTier(
    id: string, 
    tier: OrganizationTier
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Check if valid tier
      if (!Object.values(OrganizationTier).includes(tier)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization tier');
      }

      // Update tier
      const updatedOrganization = await Organization.findByIdAndUpdate(
        id,
        { $set: { 'billingDetails.tier': tier } },
        { new: true, runValidators: true }
      );

      if (!updatedOrganization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      this.logger.info('Updated organization tier', {
        organizationId: id,
        tier
      });
      
      return updatedOrganization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.updateTier', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        tier
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Add address to organization
   */
  async addAddress(
    id: string, 
    address: IOrganizationAddress
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Validate address
      if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.country) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Required address fields missing');
      }

      // Get organization
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // If the new address is marked as default, update existing addresses
      if (address.isDefault) {
        if (organization.addresses && organization.addresses.length > 0) {
          organization.addresses = organization.addresses.map(addr => ({
            ...addr,
            isDefault: false
          }));
        }
      }

      // Add new address
      if (!organization.addresses) {
        organization.addresses = [address];
      } else {
        organization.addresses.push(address);
      }

      // If it's the first address, make it default
      if (organization.addresses.length === 1) {
        organization.addresses[0].isDefault = true;
      }

      // Save and return
      await organization.save();

      this.logger.info('Added address to organization', {
        organizationId: id,
        addressType: address.type
      });
      
      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.addAddress', { 
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Update organization address by index
   */
  async updateAddress(
    id: string, 
    addressIndex: number, 
    address: Partial<IOrganizationAddress>
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Get organization
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Check if address exists
      if (!organization.addresses || !organization.addresses[addressIndex]) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Address not found');
      }

      // If updating to default, update other addresses
      if (address.isDefault) {
        organization.addresses = organization.addresses.map((addr, idx) => ({
          ...addr,
          isDefault: idx === addressIndex
        }));
      }

      // Update address fields
      organization.addresses[addressIndex] = {
        ...organization.addresses[addressIndex],
        ...address
      };

      // Save and return
      await organization.save();

      this.logger.info('Updated organization address', {
        organizationId: id,
        addressIndex
      });
      
      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.updateAddress', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        addressIndex
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Remove address from organization
   */
  async removeAddress(
    id: string, 
    addressIndex: number
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Get organization
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Check if address exists
      if (!organization.addresses || !organization.addresses[addressIndex]) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Address not found');
      }

      // Check if it's the default address
      const isDefault = organization.addresses[addressIndex].isDefault;

      // Remove address
      organization.addresses.splice(addressIndex, 1);

      // If it was the default and there are still addresses, set a new default
      if (isDefault && organization.addresses.length > 0) {
        organization.addresses[0].isDefault = true;
      }

      // Save and return
      await organization.save();

      this.logger.info('Removed address from organization', {
        organizationId: id,
        addressIndex
      });
      
      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.removeAddress', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        addressIndex
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Set main contact person
   */
  async setMainContact(
    id: string, 
    contact: IContactPerson
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Validate contact
      if (!contact.name || !contact.email) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Contact name and email are required');
      }

      // Update organization
      const updatedOrganization = await Organization.findByIdAndUpdate(
        id,
        { $set: { mainContactPerson: { ...contact, isPrimary: true } } },
        { new: true, runValidators: true }
      );

      if (!updatedOrganization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      this.logger.info('Updated organization main contact', {
        organizationId: id,
        contactEmail: contact.email
      });
      
      return updatedOrganization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.setMainContact', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        contactEmail: contact.email
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Add contact person
   */
  async addContact(
    id: string, 
    contact: IContactPerson
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Validate contact
      if (!contact.name || !contact.email) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Contact name and email are required');
      }

      // Get organization
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Check if contact already exists
      if (organization.contactPersons) {
        const existingIndex = organization.contactPersons.findIndex(
          c => c.email === contact.email
        );
        
        if (existingIndex >= 0) {
          throw new ApiError(StatusCodes.CONFLICT, 'Contact with this email already exists');
        }
      }

      // Add new contact
      if (!organization.contactPersons) {
        organization.contactPersons = [contact];
      } else {
        organization.contactPersons.push(contact);
      }

      // If it's the first contact and no main contact exists, make it the main contact
      if (organization.contactPersons.length === 1 && !organization.mainContactPerson) {
        organization.mainContactPerson = { ...contact, isPrimary: true };
      }

      // Save and return
      await organization.save();

      this.logger.info('Added contact to organization', {
        organizationId: id,
        contactEmail: contact.email
      });
      
      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.addContact', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        contactEmail: contact.email
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Remove contact person by email
   */
  async removeContact(
    id: string, 
    email: string
  ): Promise<IOrganizationDocument> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Get organization
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Check if contact exists
      if (!organization.contactPersons) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Contact not found');
      }

      const contactIndex = organization.contactPersons.findIndex(
        c => c.email === email
      );

      if (contactIndex === -1) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Contact not found');
      }

      // Check if it's the main contact
      const isMainContact = organization.mainContactPerson?.email === email;

      // Remove contact
      organization.contactPersons.splice(contactIndex, 1);

      // If it was the main contact and there are still contacts, update main contact
      if (isMainContact && organization.contactPersons.length > 0) {
        organization.mainContactPerson = { 
          ...organization.contactPersons[0],
          isPrimary: true
        };
      } else if (isMainContact) {
        organization.mainContactPerson = undefined;
      }

      // Save and return
      await organization.save();

      this.logger.info('Removed contact from organization', {
        organizationId: id,
        contactEmail: email
      });
      
      return organization;
    } catch (error) {
      this.logger.error('Error in OrganizationService.removeContact', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        email
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Get organization members
   */
  async getMembers(id: string): Promise<OrganizationMember[]> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Check if organization exists
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Get users associated with this organization
      // This would typically be implemented differently based on your user-organization relationship model
      // This is a simplified example assuming User model has an organizationId field
      const users = await User.find({ organizationId: new mongoose.Types.ObjectId(id) });

      // Map users to organization members
      const members: OrganizationMember[] = users.map(user => ({
        userId: user._id,
        email: user.email,
        name: user.name || user.email,
        role: user.role || 'member',
        status: 'active',
        joinedAt: user.createdAt
      }));

      return members;
    } catch (error) {
      this.logger.error('Error in OrganizationService.getMembers', { 
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Invite member to organization
   * Note: This is a placeholder implementation. The actual invitation logic would
   * depend on your authentication system and email service.
   */
  async inviteMember(
    id: string, 
    invitation: OrganizationInvitation, 
    invitedBy: string
  ): Promise<any> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Validate invitation
      if (!invitation.email || !invitation.role) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and role are required');
      }

      // Check if organization exists
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Check if user exists and already a member
      const existingUser = await User.findOne({ email: invitation.email });
      if (existingUser && existingUser.organizationId?.toString() === id) {
        throw new ApiError(StatusCodes.CONFLICT, 'User is already a member of this organization');
      }

      // Here you would typically:
      // 1. Create an invitation record in your database
      // 2. Generate an invitation token
      // 3. Send an email with the invitation link
      
      // For now, return a placeholder response
      const invitationResult = {
        email: invitation.email,
        role: invitation.role,
        organization: {
          id: organization._id,
          name: organization.name
        },
        invitedBy,
        expiresAt: invitation.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      this.logger.info('Invited member to organization', {
        organizationId: id,
        email: invitation.email,
        role: invitation.role
      });
      
      return invitationResult;
    } catch (error) {
      this.logger.error('Error in OrganizationService.inviteMember', { 
        error: error instanceof Error ? error.message : String(error),
        id,
        email: invitation.email
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }

  /**
   * Delete organization by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Validate input
      if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid organization ID format');
      }

      // Check if organization exists
      const organization = await Organization.findById(id);
      if (!organization) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found');
      }

      // Delete the organization
      await Organization.deleteOne({ _id: id });

      // Note: In a real-world scenario, you would typically need to:
      // 1. Handle all associated data (users, inventory, etc.)
      // 2. Consider soft deletion instead of hard deletion
      // 3. Possibly move users to a default organization

      this.logger.info('Deleted organization', {
        organizationId: id,
        name: organization.name
      });
      
      return true;
    } catch (error) {
      this.logger.error('Error in OrganizationService.delete', { 
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error instanceof Error 
        ? error 
        : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, String(error));
    }
  }
}

export default OrganizationService;
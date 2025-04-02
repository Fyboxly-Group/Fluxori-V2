import mongoose from 'mongoose';
import ResourceModel from '../models/resource.model'; // Replace with actual model
import { ApiError } from '../utils/api-error';
import { StatusCodes } from 'http-status-codes';

/**
 * Interface for Resource data
 */
interface IResource {
  _id?: string;
  name: string;
  description?: string;
  // Add other fields as needed
}

/**
 * Interface for Resource query options
 */
interface IResourceQueryOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Add other query options as needed
}

/**
 * Get all resources with pagination and filtering
 */
export const getAllResources = async (
  queryOptions: IResourceQueryOptions = {}
): Promise<{ resources: IResource[]; total: number; page: number; limit: number }> => {
  try {
    const {
      limit = 10,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryOptions;

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build query filters
    const query = {};

    // Execute query with pagination
    const resources = await ResourceModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ResourceModel.countDocuments(query);

    return {
      resources,
      total,
      page,
      limit
    };
  } catch (error) {
    console.error('Error in getAllResources service:', error);
    throw error;
  }
};

/**
 * Get a resource by ID
 */
export const getResourceById = async (id: string): Promise<IResource> => {
  try {
    const resource = await ResourceModel.findById(id).lean();

    if (!resource) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Resource not found');
    }

    return resource;
  } catch (error) {
    console.error(`Error in getResourceById service for id ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new resource
 */
export const createResource = async (resourceData: IResource): Promise<IResource> => {
  try {
    const newResource = await ResourceModel.create(resourceData);
    return newResource.toObject();
  } catch (error) {
    console.error('Error in createResource service:', error);
    throw error;
  }
};

/**
 * Update a resource by ID
 */
export const updateResource = async (id: string, updateData: Partial<IResource>): Promise<IResource> => {
  try {
    const updatedResource = await ResourceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedResource) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Resource not found');
    }

    return updatedResource;
  } catch (error) {
    console.error(`Error in updateResource service for id ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a resource by ID
 */
export const deleteResource = async (id: string): Promise<void> => {
  try {
    const deletedResource = await ResourceModel.findByIdAndDelete(id);

    if (!deletedResource) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Resource not found');
    }
  } catch (error) {
    console.error(`Error in deleteResource service for id ${id}:`, error);
    throw error;
  }
};
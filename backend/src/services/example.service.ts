import mongoose from 'mongoose';
import ExampleModel from '../models/example.model'; // Replace with actual model
import { ApiError } from '../utils/api-error';
import { StatusCodes } from 'http-status-codes';

/**
 * Interface for Example data
 */
interface IExample {
  _id?: string;
  name: string;
  description?: string;
  // Add other fields as needed
}

/**
 * Interface for Example query options
 */
interface IExampleQueryOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Add other query options as needed
}

/**
 * Get all examples with pagination and filtering
 */
export const getAllExamples = async(queryOptions: IExampleQueryOptions = {}): Promise<{ examples: IExample[]; total: number; page: number; limit: number }> => {
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
    const examples = await ExampleModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ExampleModel.countDocuments(query);

    return { 
      examples,
      total,
      page, 
      limit
    };
  } catch(error) {
    console.error('Error in getAllExamples service:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Get a example by ID
 */
export const getExampleById = async(id: string): Promise<IExample> => {
  try {
    const example = await ExampleModel.findById(id).lean();

    if(!example) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Example not found');
    }

    return example;
  } catch(error) {
    console.error(`Error in getExampleById service for id ${id}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Create a new example
 */
export const createExample = async(exampleData: IExample): Promise<IExample> => {
  try {
    const newExample = await ExampleModel.create(exampleData);
    return newExample.toObject();
  } catch(error) {
    console.error('Error in createExample service:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Update a example by ID
 */
export const updateExample = async(id: string, updateData: Partial<IExample>): Promise<IExample> => {
  try {
    const updatedExample = await ExampleModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).lean();

    if(!updatedExample) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Example not found');
    }

    return updatedExample;
  } catch(error) {
    console.error(`Error in updateExample service for id ${id}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Delete a example by ID
 */
export const deleteExample = async(id: string): Promise<void> => {
  try {
    const deletedExample = await ExampleModel.findByIdAndDelete(id);

    if(!deletedExample) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Example not found');
    }
  } catch(error) {
    console.error(`Error in deleteExample service for id ${id}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
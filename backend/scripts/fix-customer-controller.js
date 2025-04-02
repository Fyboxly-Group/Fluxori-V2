/**
 * Specialized fix script for the customer.controller.ts file
 */

const fs = require('fs');
const path = require('path');

const CONTROLLER_FILE_PATH = path.join(__dirname, '../src/controllers/customer.controller.ts');

// The correct content for the controller
const correctContent = `// Customer controller
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Customer from '../models/customer.model';
import Order from '../models/order.model';
import Project from '../models/project.model';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string,
    organizationId: string,
    email?: string,
    role?: string,
  },
};

/**
 * Get all customers with optional filtering
 * @route GET /api/customers
 */
export const getCustomers = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, industry, size, nps, accountManager, search } = req.query;
    
    // Build query
    const query: any = {};
    
    if(status) {
      query.status = status;
    }
    
    if(industry) {
      query.industry = industry;
    }
    
    if(size) {
      query.size = size;
    }
    
    if(accountManager) {
      query.accountManager = accountManager;
    }
    
    if(nps) {
      query.nps = { $gte: Number(nps) };
    }
    
    if(search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'primaryContact.name': { $regex: search, $options: 'i' } },
        { 'primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await Customer.find(query)
      .populate('accountManager', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Get customer by ID
 * @route GET /api/customers/:id
 */
export const getCustomerById = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id)
      .populate('accountManager', 'name email')
      .populate('projects', 'name status progress startDate endDate');
    
    if(!customer) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: customer
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
export const createCustomer = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      companyName,
      industry,
      size,
      website,
      primaryContact,
      secondaryContact,
      billingAddress,
      shippingAddress,
      accountManager,
      status,
      tags
    } = req.body;
    
    // Basic validation
    if(!companyName || !industry || !primaryContact || !primaryContact.name || !primaryContact.email) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide all required fields'
      });
      return;
    }
    
    // Create customer
    const customer = await Customer.create({
      companyName,
      industry,
      size,
      website,
      primaryContact,
      secondaryContact,
      billingAddress,
      shippingAddress,
      accountManager: accountManager || (req.user as any)._id,
      status: status || 'active',
      tags,
      nps: 0, // Default NPS score
      createdBy: (req.user as any)._id
    });
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: customer
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
export const updateCustomer = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find and update customer
    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if(!customer) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: customer
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
export const deleteCustomer = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if customer has associated orders or projects
    const hasOrders = await Order.exists({ customer: id });
    const hasProjects = await Project.exists({ customer: id });
    
    if(hasOrders || hasProjects) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete customer with associated orders or projects'
      });
      return;
    }
    
    const customer = await Customer.findByIdAndDelete(id);
    
    if(!customer) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Customer not found'
      });
      return;
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Get customer statistics
 * @route GET /api/customers/stats
 */
export const getCustomerStats = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get count by status
    const statusStats = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get count by industry
    const industryStats = await Customer.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get count by size
    const sizeStats = await Customer.aggregate([
      { $group: { _id: '$size', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get average NPS
    const npsStats = await Customer.aggregate([
      { $group: { _id: null, avgNps: { $avg: '$nps' } } }
    ]);
    
    // Get top 5 account managers by number of customers
    const accountManagerStats = await Customer.aggregate([
      { $group: { _id: '$accountManager', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'accountManagerDetails'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          accountManagerName: { $arrayElemAt: ['$accountManagerDetails.name', 0] }
        }
      }
    ]);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        total: await Customer.countDocuments(),
        statusStats,
        industryStats,
        sizeStats,
        npsStats: npsStats.length > 0 ? Math.round(npsStats[0].avgNps * 10) / 10 : 0,
        accountManagerStats
      }
    });
  } catch(error) {
    next(error);
  }
};`;

console.log(`Fixing file: ${CONTROLLER_FILE_PATH}`);
fs.writeFileSync(CONTROLLER_FILE_PATH, correctContent);
console.log('Done!');
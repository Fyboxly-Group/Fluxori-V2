import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Customer from '../models/customer.model';
import { ApiError } from '../middleware/error.middleware';
import { ActivityService } from '../services/activity.service';

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      search, 
      industry, 
      size, 
      status, 
      accountManager, 
      sortBy = 'companyName',
      sortOrder = 'asc',
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query: any = {};
    
    // Search by company name, contact name or email
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'primaryContact.name': { $regex: search, $options: 'i' } },
        { 'primaryContact.email': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    if (size) {
      query.size = size;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (accountManager) {
      query.accountManager = new mongoose.Types.ObjectId(accountManager as string);
    }
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Parse sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('accountManager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    
    // Get total count
    const total = await Customer.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID');
    }
    
    const customer = await Customer.findById(customerId)
      .populate('accountManager', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
    
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private
 */
export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      companyName,
      industry,
      website,
      size,
      annualRevenue,
      logo,
      address,
      primaryContact,
      secondaryContacts,
      accountManager,
      customerSince,
      contractValue,
      contractRenewalDate,
      nps,
      status,
      tags,
      notes,
    } = req.body;
    
    // Validate required fields
    if (!companyName || !industry || !size || !primaryContact || !accountManager) {
      throw new ApiError(400, 'Please provide all required fields', {
        ...(companyName ? {} : { companyName: ['Company name is required'] }),
        ...(industry ? {} : { industry: ['Industry is required'] }),
        ...(size ? {} : { size: ['Company size is required'] }),
        ...(primaryContact ? {} : { primaryContact: ['Primary contact information is required'] }),
        ...(accountManager ? {} : { accountManager: ['Account manager is required'] }),
      });
    }
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ companyName });
    if (existingCustomer) {
      throw new ApiError(400, `Customer with name "${companyName}" already exists`);
    }
    
    // Create customer
    const customer = new Customer({
      companyName,
      industry,
      website,
      size,
      annualRevenue,
      logo,
      address,
      primaryContact,
      secondaryContacts,
      accountManager,
      customerSince: customerSince || new Date(),
      contractValue,
      contractRenewalDate,
      nps,
      status: status || 'active',
      tags,
      notes,
      createdBy: req.user?._id,
    });
    
    await customer.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Customer "${companyName}" created`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'create',
        status: 'completed',
        userId: req.user._id,
        metadata: { customerId: customer._id },
      });
    }
    
    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID');
    }
    
    // Find customer
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    
    // Update customer fields
    const updates = req.body;
    
    // Check if updating company name and it already exists
    if (updates.companyName && updates.companyName !== customer.companyName) {
      const existingCustomer = await Customer.findOne({ 
        companyName: updates.companyName,
        _id: { $ne: customerId }
      });
      
      if (existingCustomer) {
        throw new ApiError(400, `Customer with name "${updates.companyName}" already exists`);
      }
    }
    
    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        (customer as any)[key] = updates[key];
      }
    });
    
    await customer.save();
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Customer "${customer.companyName}" updated`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'update',
        status: 'completed',
        userId: req.user._id,
        metadata: { customerId: customer._id, updates },
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID');
    }
    
    // Find customer
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }
    
    // Check for dependent projects first
    // This would require importing Project model
    // const dependentProjects = await Project.countDocuments({ customer: customerId });
    // if (dependentProjects > 0) {
    //   throw new ApiError(400, `Cannot delete customer: ${dependentProjects} project(s) are associated with this customer`);
    // }
    
    // Store customer name for activity log
    const companyName = customer.companyName;
    
    // Delete customer - using deleteOne instead of remove() as remove is deprecated
    await Customer.deleteOne({ _id: customerId });
    
    // Log activity
    if (req.user) {
      await ActivityService.logActivity({
        description: `Customer "${companyName}" deleted`,
        entityType: 'user',
        entityId: req.user._id,
        action: 'delete',
        status: 'completed',
        userId: req.user._id,
        metadata: { customerId },
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/stats
 * @access  Private
 */
export const getCustomerStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get counts by status
    const statusCounts = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    // Get counts by industry
    const industryCounts = await Customer.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
    ]);
    
    // Get counts by size
    const sizeCounts = await Customer.aggregate([
      { $group: { _id: '$size', count: { $sum: 1 } } },
    ]);
    
    // Get total contract value
    const totalContractValue = await Customer.aggregate([
      { $match: { contractValue: { $exists: true, $ne: null } } },
      { $group: { _id: null, total: { $sum: '$contractValue' } } },
    ]);
    
    // Get recent customers (added in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCustomersCount = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    
    // Get renewals due in the next 90 days
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);
    
    const upcomingRenewalsCount = await Customer.countDocuments({
      contractRenewalDate: { $gte: today, $lte: ninetyDaysFromNow },
    });
    
    // Format response
    const stats = {
      totalCustomers: await Customer.countDocuments(),
      statusBreakdown: statusCounts.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      industryBreakdown: industryCounts.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      sizeBreakdown: sizeCounts.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalContractValue: totalContractValue.length > 0 ? totalContractValue[0].total : 0,
      recentCustomersCount,
      upcomingRenewalsCount,
    };
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
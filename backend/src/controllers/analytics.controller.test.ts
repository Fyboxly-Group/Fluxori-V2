import { Request, Response, NextFunction } from 'express';
import * as AnalyticsController from './analytics.controller';
import Project from '../models/project.model';
import Inventory from '../models/inventory.model';
import Shipment from '../models/shipment.model';
import Customer from '../models/customer.model';
import Supplier from '../models/supplier.model';
import PurchaseOrder from '../models/purchase-order.model';
import Task from '../models/task.model';
import Activity from '../models/activity.model';

// Mock the models
jest.mock('../models/project.model');
jest.mock('../models/inventory.model');
jest.mock('../models/shipment.model');
jest.mock('../models/customer.model');
jest.mock('../models/supplier.model');
jest.mock('../models/purchase-order.model');
jest.mock('../models/task.model');
jest.mock('../models/activity.model');

describe('Analytics Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      user: { _id: 'user123' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getBusinessOverview', () => {
    it('should return business overview counts', async () => {
      // Mock countDocuments for all models
      (Project.countDocuments as jest.Mock).mockResolvedValueOnce(10); // projectsCount
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(50); // inventoryItemsCount
      (Shipment.countDocuments as jest.Mock).mockResolvedValueOnce(20); // shipmentsCount
      (Customer.countDocuments as jest.Mock).mockResolvedValueOnce(15); // customersCount
      (Supplier.countDocuments as jest.Mock).mockResolvedValueOnce(8); // suppliersCount
      (PurchaseOrder.countDocuments as jest.Mock).mockResolvedValueOnce(25); // purchaseOrdersCount
      (Activity.countDocuments as jest.Mock).mockResolvedValueOnce(100); // activitiesCount
      (Task.countDocuments as jest.Mock).mockResolvedValueOnce(30); // tasksCount
      
      // Mock active projects count
      (Project.countDocuments as jest.Mock).mockResolvedValueOnce(7); // activeProjectsCount
      
      // Mock low stock count
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(5); // lowStockCount
      
      // Mock in-progress shipments
      (Shipment.countDocuments as jest.Mock).mockResolvedValueOnce(12); // inProgressShipmentsCount
      
      // Mock overdue tasks
      (Task.countDocuments as jest.Mock).mockResolvedValueOnce(3); // overdueTasksCount

      await AnalyticsController.getBusinessOverview(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          counts: {
            projects: 10,
            activeProjects: 7,
            inventoryItems: 50,
            lowStockItems: 5,
            shipments: 20,
            inProgressShipments: 12,
            customers: 15,
            suppliers: 8,
            purchaseOrders: 25,
            tasks: 30,
            overdueTasks: 3
          }
        }
      });
    });

    it('should handle errors and call next', async () => {
      const error = new Error('Database error');
      (Project.countDocuments as jest.Mock).mockRejectedValue(error);

      await AnalyticsController.getBusinessOverview(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProjectPerformance', () => {
    it('should return project performance analytics', async () => {
      mockRequest.query = { fromDate: '2023-01-01', toDate: '2023-12-31' };
      
      // Mock Project.aggregate for phases
      (Project.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: 'planning', count: 3 },
        { _id: 'execution', count: 4 },
        { _id: 'completion', count: 2 }
      ]);
      
      // Mock Project.aggregate for statuses
      (Project.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: 'active', count: 5 },
        { _id: 'completed', count: 3 },
        { _id: 'on-hold', count: 1 }
      ]);
      
      // Mock Project.aggregate for duration
      (Project.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: null, avgDuration: 45.5 }
      ]);
      
      // Mock Project.find for completion rate
      (Project.find as jest.Mock).mockResolvedValueOnce([
        { 
          actualCompletionDate: new Date('2023-05-15'), 
          targetCompletionDate: new Date('2023-06-01') 
        },
        { 
          actualCompletionDate: new Date('2023-07-15'), 
          targetCompletionDate: new Date('2023-07-01') 
        },
        { 
          actualCompletionDate: new Date('2023-08-15'), 
          targetCompletionDate: new Date('2023-09-01') 
        }
      ]);
      
      // Mock Project.aggregate for projects by customer
      (Project.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: 'customer1', count: 3, customerName: 'Acme Inc' },
        { _id: 'customer2', count: 2, customerName: 'Globex Corp' }
      ]);

      await AnalyticsController.getProjectPerformance(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          projectsByPhase: [
            { _id: 'planning', count: 3 },
            { _id: 'execution', count: 4 },
            { _id: 'completion', count: 2 }
          ],
          projectsByStatus: [
            { _id: 'active', count: 5 },
            { _id: 'completed', count: 3 },
            { _id: 'on-hold', count: 1 }
          ],
          averageProjectDuration: 45.5,
          onTimeCompletionRate: 66.66666666666666,
          projectsByCustomer: [
            { _id: 'customer1', count: 3, customerName: 'Acme Inc' },
            { _id: 'customer2', count: 2, customerName: 'Globex Corp' }
          ]
        }
      });
    });
  });

  describe('getInventoryAnalytics', () => {
    it('should return inventory analytics data', async () => {
      // Mock lowStockItems
      (Inventory.find as jest.Mock).mockImplementation(() => ({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue([
              { _id: 'item1', name: 'Item 1', quantity: 5 },
              { _id: 'item2', name: 'Item 2', quantity: 8 }
            ])
          }))
        }))
      }));
      
      // Mock valueByCategory
      (Inventory.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: 'electronics', totalValue: 5000, itemCount: 10 },
        { _id: 'furniture', totalValue: 3000, itemCount: 5 }
      ]);
      
      // Mock totalInventoryValue
      (Inventory.aggregate as jest.Mock).mockResolvedValueOnce([
        { _id: null, totalValue: 8000 }
      ]);
      
      // Mock noMovementItems
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(7); // noMovementItems
      
      // Mock inventoryByStatus counts
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(3); // Out of Stock
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(8); // Low Stock
      (Inventory.countDocuments as jest.Mock).mockResolvedValueOnce(39); // Adequate Stock

      await AnalyticsController.getInventoryAnalytics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonData = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonData.success).toBe(true);
      expect(jsonData.data.lowStockItems).toHaveLength(2);
      expect(jsonData.data.valueByCategory).toHaveLength(2);
      expect(jsonData.data.totalValue).toBe(8000);
      expect(jsonData.data.inventoryByStatus).toHaveLength(3);
    });
  });
});
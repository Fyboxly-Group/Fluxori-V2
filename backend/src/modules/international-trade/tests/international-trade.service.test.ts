import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import mongoose, { Types } from 'mongoose';
import { InternationalTradeService } from '../services/international-trade.service';
import { ShippingRateService } from '../services/shipping-rate.service';
import { ComplianceService } from '../services/compliance.service';
import { CustomsDocumentService } from '../services/customs-document.service';
import { InternationalShipment, CustomsDeclaration } from '../models/international-trade.model';
import { IShipmentRequest, IShippingRate } from '../interfaces/shipping-provider.interface';

// Mock the mongoose models
jest.mock('../models/international-trade.model', () => ({
  InternationalShipment: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn()
  },
  CustomsDeclaration: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

// Create mocks for dependent services
const mockShippingRateService = {
  getShippingRates: jest.fn(),
  bookShipment: jest.fn(),
  getTrackingInfo: jest.fn(),
  cancelShipment: jest.fn()
};

const mockComplianceService = {
  checkCompliance: jest.fn(),
  getRestrictedItems: jest.fn(),
  validateShipment: jest.fn()
};

const mockCustomsDocumentService = {
  generateDocument: jest.fn(),
  getDocumentTypes: jest.fn()
};

describe('InternationalTradeService', () => {
  let tradeService: InternationalTradeService;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Initialize the service with mocked dependencies
    tradeService = new InternationalTradeService(
      mockShippingRateService as unknown as ShippingRateService,
      mockComplianceService as unknown as ComplianceService,
      mockCustomsDocumentService as unknown as CustomsDocumentService
    );
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('createShipment', () => {
    test('should create a new shipment successfully', async () => {
      // Arrange
      const shipmentData = {
        origin: {
          address: '123 Sender St',
          city: 'Sender City',
          state: 'Sender State',
          postalCode: '12345',
          country: 'US'
        },
        destination: {
          address: '456 Receiver St',
          city: 'Receiver City',
          state: 'Receiver State',
          postalCode: '67890',
          country: 'CA'
        },
        packageDetails: {
          weight: 10,
          weightUnit: 'kg',
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: 'cm'
          }
        },
        items: [
          {
            description: 'Test Product',
            quantity: 2,
            value: 100
          }
        ]
      };
      
      const mockShipment = {
        _id: new Types.ObjectId(),
        ...shipmentData,
        userId: new Types.ObjectId(),
        organizationId: new Types.ObjectId(),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (InternationalShipment.create as jest.Mock).mockResolvedValue(mockShipment);
      
      // Act
      const result = await tradeService.createShipment(
        mockShipment.userId.toString(), 
        mockShipment.organizationId.toString(), 
        shipmentData
      );
      
      // Assert
      expect(InternationalShipment.create).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        organizationId: expect.any(Types.ObjectId),
        ...shipmentData,
        status: 'draft'
      });
      expect(result).toEqual({
        success: true,
        shipment: mockShipment
      });
    });
    
    test('should handle errors during shipment creation', async () => {
      // Arrange
      const shipmentData = {
        // Incomplete data to trigger error
        origin: {
          address: '123 Sender St',
          city: 'Sender City',
          state: 'Sender State',
          postalCode: '12345',
          country: 'US'
        }
      };
      
      const errorMessage = 'Validation failed';
      (InternationalShipment.create as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(tradeService.createShipment(
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
        shipmentData as any
      )).rejects.toThrow(errorMessage);
    });
  });
  
  describe('getShippingRates', () => {
    test('should return shipping rates for a valid shipment', async () => {
      // Arrange
      const shipmentId = new Types.ObjectId().toString();
      const mockShipment = {
        _id: new Types.ObjectId(shipmentId),
        origin: {
          address: '123 Sender St',
          city: 'Sender City',
          state: 'Sender State',
          postalCode: '12345',
          country: 'US'
        },
        destination: {
          address: '456 Receiver St',
          city: 'Receiver City',
          state: 'Receiver State',
          postalCode: '67890',
          country: 'CA'
        },
        packageDetails: {
          weight: 10,
          weightUnit: 'kg',
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: 'cm'
          }
        },
        items: [
          {
            description: 'Test Product',
            quantity: 2,
            value: 100
          }
        ]
      };
      
      const mockRates: IShippingRate[] = [
        {
          provider: 'DHL',
          serviceCode: 'EXPRESS',
          serviceName: 'DHL Express',
          price: 35.50,
          currency: 'USD',
          estimatedDelivery: {
            min: 1,
            max: 3
          }
        },
        {
          provider: 'FedEx',
          serviceCode: 'PRIORITY',
          serviceName: 'FedEx Priority',
          price: 42.75,
          currency: 'USD',
          estimatedDelivery: {
            min: 1,
            max: 2
          }
        }
      ];
      
      (InternationalShipment.findById as jest.Mock).mockResolvedValue(mockShipment);
      mockShippingRateService.getShippingRates.mockResolvedValue(mockRates);
      
      // Act
      const result = await tradeService.getShippingRates(shipmentId);
      
      // Assert
      expect(InternationalShipment.findById).toHaveBeenCalledWith(shipmentId);
      expect(mockShippingRateService.getShippingRates).toHaveBeenCalledWith(shipmentId, undefined);
      expect(result).toEqual(mockRates);
    });
    
    test('should throw an error if shipment does not exist', async () => {
      // Arrange
      const shipmentId = new Types.ObjectId().toString();
      (InternationalShipment.findById as jest.Mock).mockResolvedValue(null);
      
      // Act & Assert
      await expect(tradeService.getShippingRates(shipmentId))
        .rejects.toThrow('Shipment not found');
    });
  });
  
  // Additional test cases would go here
});

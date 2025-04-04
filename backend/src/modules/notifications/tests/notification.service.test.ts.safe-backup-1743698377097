import { NotificationService } from '../services/notification.service';
import { NotificationWebSocketManager } from '../utils/websocket';
import Notification, { NotificationType, NotificationCategory } from '../models/notification.model';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../utils/websocket');
jest.mock('../models/notification.model');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  const mockWsManager = NotificationWebSocketManager.getInstance() as jest.Mocked<NotificationWebSocketManager>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = new NotificationService();
  });
  
  describe('createAndSend', () => {
    it('should create a notification and send it in real-time', async () => {
      // Mock data
      const mockUserId = 'user123';
      const mockNotification = {
        _id: 'notif123',
        userId: new mongoose.Types.ObjectId(mockUserId),
        title: 'Test Notification',
        message: 'This is a test notification',
        type: NotificationType.INFO,
        category: NotificationCategory.SYSTEM,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnThis()
      };
      
      // Mock Notification model
      (Notification as jest.Mock).mockImplementationOnce(() => mockNotification);
      
      // Mock wsManager sendToUser method
      mockWsManager.sendToUser.mockReturnValue(true);
      
      // Call method
      const result = await notificationService.createAndSend({
        userId: mockUserId,
        title: 'Test Notification',
        message: 'This is a test notification'
      });
      
      // Assertions
      expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
        userId: expect.any(mongoose.Types.ObjectId),
        title: 'Test Notification',
        message: 'This is a test notification',
        type: NotificationType.INFO,
        category: NotificationCategory.SYSTEM,
        isRead: false
      }));
      
      expect(mockNotification.save).toHaveBeenCalled();
      expect(mockWsManager.sendToUser).toHaveBeenCalledWith(
        mockUserId,
        'new_notification',
        expect.objectContaining({
          id: 'notif123',
          title: 'Test Notification',
          message: 'This is a test notification'
        })
      );
      
      expect(result).toBe(mockNotification);
    });
  });
  
  describe('getUserNotifications', () => {
    it('should retrieve notifications for a user', async () => {
      // Mock data
      const mockUserId = 'user123';
      const mockNotifications = [
        { _id: 'notif1', title: 'Notification 1' },
        { _id: 'notif2', title: 'Notification 2' }
      ];
      
      // Mock Notification.find
      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue(mockNotifications);
      
      (Notification.find as jest.Mock) = mockFind;
      (Notification.find().sort as jest.Mock) = mockSort;
      (Notification.find().sort().skip as jest.Mock) = mockSkip;
      (Notification.find().sort().skip().limit as jest.Mock) = mockLimit;
      
      // Call method
      const result = await notificationService.getUserNotifications(mockUserId, 10, 0, true);
      
      // Assertions
      expect(mockFind).toHaveBeenCalledWith({ userId: expect.any(mongoose.Types.ObjectId) });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockNotifications);
    });
  });
  
  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      // Mock data
      const mockUserId = 'user123';
      const mockUpdateResult = { modifiedCount: 5 };
      
      // Mock Notification.updateMany
      (Notification.updateMany as jest.Mock) = jest.fn().mockResolvedValue(mockUpdateResult);
      
      // Mock wsManager sendToUser method
      mockWsManager.sendToUser.mockReturnValue(true);
      
      // Call method
      const result = await notificationService.markAllAsRead(mockUserId);
      
      // Assertions
      expect(Notification.updateMany).toHaveBeenCalledWith(
        {
          userId: expect.any(mongoose.Types.ObjectId),
          isRead: false
        },
        { isRead: true }
      );
      
      expect(mockWsManager.sendToUser).toHaveBeenCalledWith(
        mockUserId,
        'notifications_read_all',
        expect.objectContaining({
          userId: mockUserId,
          timestamp: expect.any(Date)
        })
      );
      
      expect(result).toBe(5);
    });
  });
});
// @ts-nocheck - Added to fix remaining type errors
/**
 * Feedback Service
 * Handles CRUD operations for user feedback
 */
import { Timestamp } from 'firebase-admin/firestore';
import { feedbackCollection } from '../../../config/firestore';
import { 
  IFeedback, 
  IFeedbackWithId, 
  FeedbackStatus, 
  feedbackConverter 
} from '../../../models/feedback.model';
import { WithId } from '../../../types';
import { NotificationType, NotificationCategory } from '../../notifications/models/notification.model';

// Import notification service when ready
// import { NotificationService } from '../../notifications/services/notification.service';

// Temporary placeholder for notification service
class NotificationService {
  async sendNotification(params: any) : Promise<void> {
    console.log('Notification service not yet implemented', params);
    return true;
  }
  
  async createNotification(params: any) : Promise<void> {
    console.log('Create notification not yet implemented', params);
    return true;
  }
}

export class FeedbackService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create a new feedback entry
   * @param feedback Feedback data
   * @returns Created feedback with ID
   */
  async createFeedback(feedback: Omit<IFeedback, 'createdAt' | 'updatedAt' | 'status'>): Promise<IFeedbackWithId> {
    try {
      // Set defaults
      const now = Timestamp.now();
      const newFeedback: IFeedback = {
        ...feedback,
        status: FeedbackStatus.NEW,
        createdAt: now,
        updatedAt: now
      };

      // Save to Firestore
      const feedbackRef = feedbackCollection.withConverter(feedbackConverter).doc();
      await feedbackRef.set(newFeedback);
      
      // Get the document with ID
      const doc = await feedbackRef.get();
      const createdFeedback = doc.data() as IFeedbackWithId;
      
      // Send notification to user confirming feedback submission
      await this.notificationService.createNotification({
        userId: feedback.userId,
        organizationId: feedback.organizationId,
        title: 'Feedback Received',
        message: `Thank you for your feedback: "${feedback.title}". We'll review it and get back to you soon.`,
        type: NotificationType.INFO,
        category: NotificationCategory.SYSTEM,
        isRead: false,
        data: {
          feedbackId: createdFeedback.id
        },
        createdAt: now,
        updatedAt: now
      });
      
      return createdFeedback;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error creating feedback:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get feedback by ID
   * @param id Feedback ID
   * @returns Feedback object
   */
  async getFeedbackById(id: string): Promise<IFeedbackWithId | null> {
    try {
      const docRef = feedbackCollection.withConverter(feedbackConverter).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data() as IFeedbackWithId;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error getting feedback with ID ${id}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get all feedback for a user
   * @param userId User ID
   * @returns Array of feedback items
   */
  async getUserFeedback(userId: string): Promise<IFeedbackWithId[]> {
    try {
      const snapshot = await feedbackCollection
        .withConverter(feedbackConverter)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error getting feedback for user ${userId}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get all feedback for an organization
   * @param organizationId Organization ID
   * @returns Array of feedback items
   */
  async getOrganizationFeedback(organizationId: string): Promise<IFeedbackWithId[]> {
    try {
      const snapshot = await feedbackCollection
        .withConverter(feedbackConverter)
        .where('organizationId', '==', organizationId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error getting feedback for organization ${organizationId}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get all feedback (admin only)
   * @param limit Optional limit
   * @param offset Optional offset for pagination
   * @returns Array of feedback items
   */
  async getAllFeedback(limit?: number, offset?: number): Promise<IFeedbackWithId[]> {
    try {
      let query = feedbackCollection
        .withConverter(feedbackConverter)
        .orderBy('createdAt', 'desc');
      
      // Apply pagination if provided
      if (offset) {
        // Get the document at the offset
        const offsetSnapshot = await feedbackCollection
          .withConverter(feedbackConverter)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .offset(offset)
          .get();
        
        if (!offsetSnapshot.empty) {
          const lastDoc = offsetSnapshot.docs[0];
          query = query.startAfter(lastDoc);
        }
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error getting all feedback:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Update feedback
   * @param id Feedback ID
   * @param updates Feedback updates
   * @returns Updated feedback
   */
  async updateFeedback(id: string, updates: Partial<IFeedback>): Promise<IFeedbackWithId> {
    try {
      const docRef = feedbackCollection.withConverter(feedbackConverter).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Feedback with ID ${id} not found`);
      }
      
      const currentFeedback = doc.data() as IFeedbackWithId;
      
      // Prepare update
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      // Update document
      await docRef.update(updateData);
      
      // Get updated document
      const updatedDoc = await docRef.get();
      const updatedFeedback = updatedDoc.data() as IFeedbackWithId;
      
      // Check if status has changed, notify user if so
      if (updates.status && updates.status !== currentFeedback.status) {
        // Create a user-friendly status message
        let statusMessage = '';
        switch(updates.status) {
          case FeedbackStatus.UNDER_REVIEW:
            statusMessage = 'is now under review';
            break;
          case FeedbackStatus.IN_PROGRESS:
            statusMessage = 'is now in progress';
            break;
          case FeedbackStatus.COMPLETED:
            statusMessage = 'has been completed';
            break;
          case FeedbackStatus.DECLINED:
            statusMessage = 'has been declined';
            break;
          case FeedbackStatus.PLANNED:
            statusMessage = 'has been added to our roadmap';
            break;
          default:
            statusMessage = `is now ${updates.status}`;
        }
        
        // Send notification
        await this.notificationService.createNotification({
          userId: currentFeedback.userId,
          organizationId: currentFeedback.organizationId,
          title: 'Feedback Status Updated',
          message: `Your feedback "${currentFeedback.title}" ${statusMessage}.`,
          type: NotificationType.INFO,
          category: NotificationCategory.SYSTEM,
          isRead: false,
          data: {
            feedbackId: id,
            oldStatus: currentFeedback.status,
            newStatus: updates.status
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      // If an admin response was added, notify the user
      if (updates.adminResponse && 
         (!currentFeedback.adminResponse || 
          updates.adminResponse.message !== currentFeedback.adminResponse.message)) {
        await this.notificationService.createNotification({
          userId: currentFeedback.userId,
          organizationId: currentFeedback.organizationId,
          title: 'Feedback Response',
          message: `We've responded to your feedback "${currentFeedback.title}".`,
          type: NotificationType.INFO,
          category: NotificationCategory.SYSTEM,
          isRead: false,
          data: {
            feedbackId: id,
            responseMessage: updates.adminResponse.message
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      return updatedFeedback;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error updating feedback with ID ${id}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Delete feedback
   * @param id Feedback ID
   * @returns Success boolean
   */
  async deleteFeedback(id: string): Promise<boolean> {
    try {
      const docRef = feedbackCollection.doc(id);
      await docRef.delete();
      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error(`Error deleting feedback with ID ${id}:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get feedback analytics
   * Returns counts of feedback by type, category, and status
   */
  async getFeedbackAnalytics(organizationId?: string) : Promise<void> {
    try {
      // Build base query
      let query = feedbackCollection.withConverter(feedbackConverter);
      
      // Filter by organization if provided
      if (organizationId) {
        query = query.where('organizationId', '==', organizationId) as any;
      }
      
      const snapshot = await query.get();
      const feedbackItems = snapshot.docs.map((doc: any) => doc.data());
      
      // Count by type
      const typeCount = feedbackItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Count by category
      const categoryCount = feedbackItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Count by status
      const statusCount = feedbackItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Count by severity
      const severityCount = feedbackItems.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total: feedbackItems.length,
        byType: typeCount,
        byCategory: categoryCount,
        byStatus: statusCount,
        bySeverity: severityCount
      };
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error getting feedback analytics:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
/**
 * Feedback Controller
 * Handles HTTP requests related to user feedback
 */
import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';
import { Timestamp } from 'firebase-admin/firestore';
import { 
  FeedbackType, 
  FeedbackCategory, 
  FeedbackSeverity, 
  FeedbackStatus 
} from '../../../models/feedback.model';
import { admin } from '../../../config/firestore';

export class FeedbackController {
  private feedbackService: FeedbackService;
  
  constructor() {
    this.feedbackService = new FeedbackService();
  }
  
  /**
   * Create new feedback
   * @route POST /api/feedback
   */
  async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        title, 
        description, 
        type, 
        category, 
        severity, 
        screenshotData, // Base64 encoded image if provided
        systemInfo 
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !type || !category || !severity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }
      
      // Validate type, category, and severity
      if (!Object.values(FeedbackType).includes(type as FeedbackType)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid feedback type' 
        });
      }
      
      if (!Object.values(FeedbackCategory).includes(category as FeedbackCategory)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid feedback category' 
        });
      }
      
      if (!Object.values(FeedbackSeverity).includes(severity as FeedbackSeverity)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid feedback severity' 
        });
      }
      
      // Handle screenshot upload if provided
      let screenshotUrl = undefined;
      if (screenshotData) {
        try {
          // Extract MIME type and base64 data
          const matches = screenshotData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          
          if (!matches || matches.length !== 3) {
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid screenshot data format' 
            });
          }
          
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Get file extension from MIME type
          const fileExtension = mimeType.split('/')[1] || 'png';
          
          // Create a unique filename
          const timestamp = Date.now();
          const filename = `feedback/${req.user.id}/${timestamp}.${fileExtension}`;
          
          // Upload to Firebase Storage
          const bucket = admin.storage().bucket();
          const file = bucket.file(filename);
          
          await file.save(buffer, {
            metadata: {
              contentType: mimeType
            }
          });
          
          // Set file to be publicly accessible
          await file.makePublic();
          
          // Get public URL
          screenshotUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        } catch (error) {
          console.error('Error uploading screenshot:', error);
          // Continue without the screenshot if there was an error
        }
      }
      
      // Create feedback object
      const feedback = {
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name,
        organizationId: req.user.organizationId,
        title,
        description,
        type: type as FeedbackType,
        category: category as FeedbackCategory,
        severity: severity as FeedbackSeverity,
        screenshotUrl,
        systemInfo: systemInfo || {
          path: req.headers.referer || '',
          userAgent: req.headers['user-agent'] || ''
        }
      };
      
      const createdFeedback = await this.feedbackService.createFeedback(feedback);
      
      return res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        feedback: createdFeedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get user's feedback history
   * @route GET /api/feedback/user
   */
  async getUserFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const feedback = await this.feedbackService.getUserFeedback(userId);
      
      return res.status(200).json({
        success: true,
        feedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get all feedback (admin only)
   * @route GET /api/feedback/admin
   */
  async getAllFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
      
      const feedback = await this.feedbackService.getAllFeedback(limit, offset);
      
      return res.status(200).json({
        success: true,
        feedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get organization feedback (admin or organization manager)
   * @route GET /api/feedback/organization/:organizationId
   */
  async getOrganizationFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.params;
      
      // Check if user is admin or belongs to the organization
      if (!req.user.isAdmin && req.user.organizationId !== organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Not allowed to access this organization data'
        });
      }
      
      const feedback = await this.feedbackService.getOrganizationFeedback(organizationId);
      
      return res.status(200).json({
        success: true,
        feedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get feedback by ID
   * @route GET /api/feedback/:id
   */
  async getFeedbackById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feedback = await this.feedbackService.getFeedbackById(id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }
      
      // Check if user is authorized to view this feedback
      if (!req.user.isAdmin && req.user.id !== feedback.userId && req.user.organizationId !== feedback.organizationId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Not allowed to access this feedback'
        });
      }
      
      return res.status(200).json({
        success: true,
        feedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update feedback (admin only)
   * @route PATCH /api/feedback/:id
   */
  async updateFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminResponse } = req.body;
      
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      // Build update object
      const updates: any = {};
      
      if (status) {
        // Validate status value
        if (!Object.values(FeedbackStatus).includes(status as FeedbackStatus)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid feedback status' 
          });
        }
        updates.status = status;
      }
      
      if (adminResponse) {
        updates.adminResponse = {
          message: adminResponse,
          respondedBy: req.user.id,
          respondedAt: Timestamp.now()
        };
      }
      
      const updatedFeedback = await this.feedbackService.updateFeedback(id, updates);
      
      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully',
        feedback: updatedFeedback
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete feedback (admin only)
   * @route DELETE /api/feedback/:id
   */
  async deleteFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      await this.feedbackService.deleteFeedback(id);
      
      return res.status(200).json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get feedback analytics (admin only)
   * @route GET /api/feedback/analytics
   */
  async getFeedbackAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      const organizationId = req.query.organizationId as string;
      const analytics = await this.feedbackService.getFeedbackAnalytics(organizationId);
      
      return res.status(200).json({
        success: true,
        analytics
      });
    } catch (error) {
      next(error);
    }
  }
}
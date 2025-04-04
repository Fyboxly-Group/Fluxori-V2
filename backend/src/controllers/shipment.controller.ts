import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Shipment from '../models/shipment.model';
import { ApiError } from '../middleware/error.middleware';
import storageService from '../services/storage.service';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * @desc    Add document to shipment
 * @route   POST /api/shipments/:id/documents
 * @access  Private
 * @swagger
 * /shipments/{id}/documents:
 *   post:
 *     summary: Add a document to a shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - fileUrl
 *               - fileType
 *             properties:
 *               title:
 *                 type: string
 *                 description: Document title
 *               fileUrl:
 *                 type: string
 *                 description: URL to the uploaded file
 *               fileType:
 *                 type: string
 *                 description: MIME type of the file
 *               category:
 *                 type: string
 *                 description: Document category (invoice, packing slip, etc.)
 *                 default: other
 *     responses:
 *       201:
 *         description: Document added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     fileUrl:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     category:
 *                       type: string
 *                     uploadedBy:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or shipment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const addShipmentDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipmentId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      throw new ApiError(400, 'Invalid shipment ID');
    }
    
    // Find shipment
    const shipment = await Shipment.findById(shipmentId);
    
    if (!shipment) {
      throw new ApiError(404, 'Shipment not found');
    }
    
    const { title, fileUrl, fileType, category } = req.body;
    
    if (!title || !fileUrl || !fileType) {
      throw new ApiError(400, 'Title, file URL, and file type are required fields');
    }
    
    // Add document
    if (!shipment.documents) {
      shipment.documents = [];
    }
    
    shipment.documents.push({
      title,
      fileUrl,
      fileType,
      category: category || 'other',
      uploadedBy: req.user?._id,
      uploadedAt: new Date(),
    });
    
    await shipment.save();
    
    // Return the added document
    const addedDocument = shipment.documents[shipment.documents.length - 1];
    
    res.status(201).json({
      success: true,
      data: addedDocument,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Remove document from shipment
 * @route   DELETE /api/shipments/:id/documents/:documentId
 * @access  Private
 * @swagger
 * /shipments/{id}/documents/{documentId}:
 *   delete:
 *     summary: Remove a document from a shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Document removed successfully
 *       400:
 *         description: Invalid shipment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment or document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const removeShipmentDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: shipmentId, documentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      throw new ApiError(400, 'Invalid shipment ID');
    }
    
    // Find shipment
    const shipment = await Shipment.findById(shipmentId);
    
    if (!shipment) {
      throw new ApiError(404, 'Shipment not found');
    }
    
    // Find document index
    if (!shipment.documents) {
      throw new ApiError(404, 'No documents found for this shipment');
    }
    
    const documentIndex = shipment.documents.findIndex(
      doc => (doc as any)._id.toString() === documentId
    );
    
    if (documentIndex === -1) {
      throw new ApiError(404, 'Document not found in this shipment');
    }
    
    // Get document details before removing
    const document = shipment.documents[documentIndex];
    
    // Try to delete the file from storage
    try {
      await storageService.deleteFile(document.fileUrl);
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      console.error('Error deleting file from storage:', error);
      // Continue with document removal even if file deletion fails
    }
    
    // Remove document from shipment
    shipment.documents.splice(documentIndex, 1);
    await shipment.save();
    
    res.status(200).json({
      success: true,
      message: 'Document removed successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};

/**
 * @desc    Get all documents for a shipment
 * @route   GET /api/shipments/:id/documents
 * @access  Private
 * @swagger
 * /shipments/{id}/documents:
 *   get:
 *     summary: Get all documents for a shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: List of shipment documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of documents
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       fileUrl:
 *                         type: string
 *                       fileType:
 *                         type: string
 *                       category:
 *                         type: string
 *                       uploadedBy:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid shipment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getShipmentDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipmentId = req.params.id as any;
    
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      throw new ApiError(400, 'Invalid shipment ID');
    }
    
    // Find shipment with populated document uploader details
    const shipment = await Shipment.findById(shipmentId)
      .populate('documents.uploadedBy', 'firstName lastName email');
    
    if (!shipment) {
      throw new ApiError(404, 'Shipment not found');
    }
    
    // Return documents or empty array
    const documents = shipment.documents || [];
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    next(error);
  }
};
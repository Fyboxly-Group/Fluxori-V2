import Joi from 'joi';
import { EntityNameStatus } from '../models/entityName.model';

/**
 * Schema for creating a new {{entityName}}
 * @swagger
 * components:
 *   schemas:
 *     Create{{EntityName}}:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: {{EntityName}} name
 *         description:
 *           type: string
 *           description: {{EntityName}} description
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           default: active
 *           description: {{EntityName}} status
 *         metadata:
 *           type: object
 *           description: Additional metadata for the {{entityName}}
 */
export const CreateEntityNameSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(1000),
  status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
  // Add specific validation rules for your entity properties here
  metadata: Joi.object().optional()
});

/**
 * Schema for updating an existing entityName
 * @swagger
 * components:
 *   schemas:
 *     UpdateEntityName:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: EntityName name
 *         description:
 *           type: string
 *           description: EntityName description
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           description: EntityName status
 *         metadata:
 *           type: object
 *           description: Additional metadata for the entityName
 */
export const UpdateEntityNameSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(1000),
  status: Joi.string().valid('active', 'inactive', 'archived').optional(),
  // Add specific validation rules for your entity properties here
  metadata: Joi.object().optional()
}).min(1); // At least one field must be present

/**
 * Schema for entityName query parameters
 */
export const EntityNameQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
  status: Joi.string().valid('active', 'inactive', 'archived', 'all').default('active'),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional().max(100)
  // Add specific query parameters for your entity here
});
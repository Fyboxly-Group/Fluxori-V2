/**
 * MongoDB and Mongoose specific type definitions
 */
import { Document, PipelineStage, AggregatePaginateModel, FilterQuery } from 'mongoose';

/**
 * Base interface for MongoDB aggregation results
 */
export interface IAggregationResult {
  _id: string | null;
  count?: number;
  [key: string]: any;
}

/**
 * Interface for time series aggregation results
 */
export interface ITimeSeriesAggregationResult extends IAggregationResult {
  _id: {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
  };
  count: number;
}

/**
 * Interface for time-based group formats in aggregation pipelines
 */
export interface ITimeSeriesGroupIdFormat {
  year?: { $year: { $toDate: "$createdAt" } };
  month?: { $month: { $toDate: "$createdAt" } };
  week?: { $week: { $toDate: "$createdAt" } };
  day?: { $dayOfMonth: { $toDate: "$createdAt" } };
  hour?: { $hour: { $toDate: "$createdAt" } };
}

/**
 * Interface for aggregation results with category data
 */
export interface ICategoryAggregationResult extends IAggregationResult {
  _id: string;
  count: number;
  totalValue?: number;
  items?: any[];
}

/**
 * Interface for data with value metrics
 */
export interface IValueDataPoint {
  _id: string;
  totalValue: number;
  itemCount: number;
}

/**
 * Interface for normalized aggregation results suitable for frontend display
 */
export interface INormalizedAggregation {
  _id: string;
  count: number;
  [key: string]: any;
}

/**
 * MongoDB document converter utility for aggregation results
 */
export function normalizeAggregationResult<T extends IAggregationResult>(results: T[]): INormalizedAggregation[] {
  return results.map(result => ({
    _id: result._id || 'unknown',
    count: result.count || 0,
    ...Object.entries(result)
      .filter(([key]) => !['_id', 'count'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }));
}

/**
 * Utility for creating safe aggregation pipelines
 */
export function createAggregationPipeline(stages: PipelineStage[]): PipelineStage[] {
  return stages;
}

/**
 * Type guard for checking if a value is an aggregation result
 */
export function isAggregationResult(value: any): value is IAggregationResult {
  return value && typeof value === 'object' && '_id' in value;
}